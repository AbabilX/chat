package store

import (
	"context"
	"fmt"
)

// MarkDelivered stamps delivery for one recipient of one message.
func (s *Store) MarkDelivered(ctx context.Context, messageID, userID string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE message_receipts SET delivered_at = now()
		WHERE message_id = $1 AND user_id = $2 AND delivered_at IS NULL`,
		messageID, userID)
	return err
}

// MarkDeliveredUpTo stamps delivery for all of a user's undelivered receipts
// in a conversation up to a seq. Returns affected message senders.
func (s *Store) MarkDeliveredUpTo(ctx context.Context, convID, userID string, upToSeq int64) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE message_receipts r SET delivered_at = now()
		FROM messages m
		WHERE r.message_id = m.id
		  AND m.conversation_id = $1
		  AND r.user_id = $2
		  AND m.seq <= $3
		  AND r.delivered_at IS NULL`,
		convID, userID, upToSeq)
	return err
}

// MarkSeenUpTo stamps seen (and delivered) for all messages up to a seq and
// advances the member's last_read_seq.
func (s *Store) MarkSeenUpTo(ctx context.Context, convID, userID string, upToSeq int64) error {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		UPDATE message_receipts r
		SET seen_at = now(), delivered_at = COALESCE(r.delivered_at, now())
		FROM messages m
		WHERE r.message_id = m.id
		  AND m.conversation_id = $1
		  AND r.user_id = $2
		  AND m.seq <= $3
		  AND r.seen_at IS NULL`,
		convID, userID, upToSeq)
	if err != nil {
		return fmt.Errorf("mark seen: %w", err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE conversation_members
		SET last_read_seq = GREATEST(last_read_seq, $3)
		WHERE conversation_id = $1 AND user_id = $2`,
		convID, userID, upToSeq)
	if err != nil {
		return fmt.Errorf("advance last_read_seq: %w", err)
	}
	return tx.Commit(ctx)
}

func (s *Store) MarkUnreadFrom(ctx context.Context, convID, userID string, seq int64) error {
	if seq <= 0 {
		return nil
	}
	_, err := s.Pool.Exec(ctx, `
		UPDATE conversation_members
		SET last_read_seq = LEAST(last_read_seq, $3)
		WHERE conversation_id = $1 AND user_id = $2`,
		convID, userID, seq-1)
	return err
}

// MessageStatus is the sender-side aggregate for one message.
type MessageStatus struct {
	MessageID string `json:"message_id"`
	Seq       int64  `json:"seq"`
	Status    string `json:"status"` // sent | delivered | seen
}

// StatusesFor returns aggregate delivery status for a sender's messages in a
// conversation: seen if all recipients saw it, delivered if all received it.
func (s *Store) StatusesFor(ctx context.Context, convID, senderID string) ([]*MessageStatus, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT m.id, m.seq,
		       CASE
		         WHEN bool_and(r.seen_at IS NOT NULL) THEN 'seen'
		         WHEN bool_and(r.delivered_at IS NOT NULL) THEN 'delivered'
		         ELSE 'sent'
		       END AS status
		FROM messages m
		JOIN message_receipts r ON r.message_id = m.id
		WHERE m.conversation_id = $1 AND m.sender_id = $2
		GROUP BY m.id, m.seq`, convID, senderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*MessageStatus
	for rows.Next() {
		var ms MessageStatus
		if err := rows.Scan(&ms.MessageID, &ms.Seq, &ms.Status); err != nil {
			return nil, err
		}
		out = append(out, &ms)
	}
	return out, rows.Err()
}
