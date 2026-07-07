package store

import (
	"context"
	"fmt"
)

// ConversationList returns all conversations for a user with last message,
// unread count, and member previews.
func (s *Store) ConversationList(ctx context.Context, userID string) ([]*ConversationSummary, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT c.id, c.type, c.title, c.avatar_url, c.last_seq, c.created_by, c.created_at,
		       m.last_read_seq,
		       GREATEST(c.last_seq - m.last_read_seq, 0) AS unread
		FROM conversations c
		JOIN conversation_members m ON m.conversation_id = c.id
		WHERE m.user_id = $1
		ORDER BY c.last_seq DESC, c.created_at DESC`, userID)
	if err != nil {
		return nil, fmt.Errorf("conversation list: %w", err)
	}
	defer rows.Close()

	var list []*ConversationSummary
	for rows.Next() {
		var cs ConversationSummary
		if err := rows.Scan(&cs.ID, &cs.Type, &cs.Title, &cs.AvatarURL, &cs.LastSeq,
			&cs.CreatedBy, &cs.CreatedAt, &cs.LastReadSeq, &cs.Unread); err != nil {
			return nil, err
		}
		list = append(list, &cs)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, cs := range list {
		if err := s.fillSummary(ctx, cs); err != nil {
			return nil, err
		}
	}
	return list, nil
}

func (s *Store) fillSummary(ctx context.Context, cs *ConversationSummary) error {
	members, err := s.Members(ctx, cs.ID)
	if err != nil {
		return err
	}
	cs.Members = members

	if cs.LastSeq > 0 {
		msg, err := s.LastMessage(ctx, cs.ID)
		if err == nil {
			cs.LastMessage = msg
		}
	}
	return nil
}
