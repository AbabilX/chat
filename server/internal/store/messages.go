package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

type Message struct {
	ID             string      `json:"id"`
	ConversationID string      `json:"conversation_id"`
	Seq            int64       `json:"seq"`
	SenderID       string      `json:"sender_id"`
	ParentID       *string     `json:"parent_id"`
	Kind           string      `json:"kind"`
	Body           string      `json:"body"`
	Mentions       []string    `json:"mentions"`
	ReplyCount     int         `json:"reply_count"`
	CreatedAt      time.Time   `json:"created_at"`
	Attachment     *Attachment `json:"attachment,omitempty"`
	Reactions      []Reaction  `json:"reactions"`
	Saved          bool        `json:"saved"`
}

const msgCols = `id, conversation_id, seq, sender_id, parent_id, kind, body, mentions, reply_count, created_at`

func scanMessage(row pgx.Row) (*Message, error) {
	var m Message
	err := row.Scan(&m.ID, &m.ConversationID, &m.Seq, &m.SenderID, &m.ParentID,
		&m.Kind, &m.Body, &m.Mentions, &m.ReplyCount, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if m.Mentions == nil {
		m.Mentions = []string{}
	}
	return &m, nil
}

type NewMessage struct {
	ID             string
	ConversationID string
	SenderID       string
	ParentID       *string
	Kind           string
	Body           string
	Mentions       []string
	Attachment     *NewAttachment
}

// InsertMessage persists a message with a fresh per-conversation seq and
// creates receipt rows for every other member. Idempotent on message ID:
// resending returns the already-stored message.
func (s *Store) InsertMessage(ctx context.Context, in NewMessage) (*Message, bool, error) {
	existing, err := s.MessageByID(ctx, in.ID)
	if err == nil {
		return existing, false, nil
	}
	if !errors.Is(err, ErrNotFound) {
		return nil, false, err
	}

	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, false, err
	}
	defer tx.Rollback(ctx)

	var seq int64
	err = tx.QueryRow(ctx, `
		UPDATE conversations SET last_seq = last_seq + 1
		WHERE id = $1 RETURNING last_seq`, in.ConversationID).Scan(&seq)
	if err != nil {
		return nil, false, fmt.Errorf("bump seq: %w", err)
	}

	if in.Mentions == nil {
		in.Mentions = []string{}
	}
	row := tx.QueryRow(ctx, `
		INSERT INTO messages (id, conversation_id, seq, sender_id, parent_id, kind, body, mentions)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING `+msgCols,
		in.ID, in.ConversationID, seq, in.SenderID, in.ParentID, in.Kind, in.Body, in.Mentions)
	msg, err := scanMessage(row)
	if err != nil {
		return nil, false, fmt.Errorf("insert message: %w", err)
	}

	if in.ParentID != nil {
		_, err = tx.Exec(ctx,
			`UPDATE messages SET reply_count = reply_count + 1 WHERE id = $1`, *in.ParentID)
		if err != nil {
			return nil, false, fmt.Errorf("bump reply count: %w", err)
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO message_receipts (message_id, user_id)
		SELECT $1, user_id FROM conversation_members
		WHERE conversation_id = $2 AND user_id != $3`,
		msg.ID, in.ConversationID, in.SenderID)
	if err != nil {
		return nil, false, fmt.Errorf("insert receipts: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, false, err
	}

	if in.Kind == "image" && in.Attachment != nil {
		if err := s.insertAttachment(ctx, msg.ID, *in.Attachment); err != nil {
			return nil, false, fmt.Errorf("insert attachment: %w", err)
		}
		msg.Attachment = &Attachment{
			ObjectKey: in.Attachment.ObjectKey,
			MimeType:  in.Attachment.MimeType,
			Width:     in.Attachment.Width,
			Height:    in.Attachment.Height,
			URL:       s.attachmentURL(in.Attachment.ObjectKey),
		}
	}
	return msg, true, nil
}

func (s *Store) MessageByID(ctx context.Context, id string) (*Message, error) {
	row := s.Pool.QueryRow(ctx, `SELECT `+msgCols+` FROM messages WHERE id = $1`, id)
	return scanMessage(row)
}

func (s *Store) LastMessage(ctx context.Context, convID string) (*Message, error) {
	row := s.Pool.QueryRow(ctx, `
		SELECT `+msgCols+` FROM messages
		WHERE conversation_id = $1 ORDER BY seq DESC LIMIT 1`, convID)
	return scanMessage(row)
}

// History returns top-level messages (thread replies excluded) newest-first.
func (s *Store) History(ctx context.Context, convID string, beforeSeq int64, limit int) ([]*Message, error) {
	if beforeSeq <= 0 {
		beforeSeq = 1<<62 - 1
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT `+msgCols+` FROM messages
		WHERE conversation_id = $1 AND seq < $2 AND parent_id IS NULL
		ORDER BY seq DESC LIMIT $3`, convID, beforeSeq, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var msgs []*Message
	for rows.Next() {
		m, err := scanMessage(rows)
		if err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return msgs, s.fillAttachments(ctx, msgs)
}
