package store

import (
	"context"
	"fmt"
)

// CreateGroup creates a group conversation with the creator as admin.
func (s *Store) CreateGroup(ctx context.Context, creatorID, title string, memberIDs []string) (*Conversation, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var c Conversation
	err = tx.QueryRow(ctx, `
		INSERT INTO conversations (type, title, created_by)
		VALUES ('group', $1, $2)
		RETURNING id, type, title, avatar_url, last_seq, created_by, created_at`,
		title, creatorID,
	).Scan(&c.ID, &c.Type, &c.Title, &c.AvatarURL, &c.LastSeq, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert group: %w", err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO conversation_members (conversation_id, user_id, role)
		VALUES ($1, $2, 'admin')`, c.ID, creatorID)
	if err != nil {
		return nil, fmt.Errorf("insert admin: %w", err)
	}
	for _, uid := range memberIDs {
		if uid == creatorID {
			continue
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO conversation_members (conversation_id, user_id)
			VALUES ($1, $2) ON CONFLICT DO NOTHING`, c.ID, uid)
		if err != nil {
			return nil, fmt.Errorf("insert member: %w", err)
		}
	}
	return &c, tx.Commit(ctx)
}
