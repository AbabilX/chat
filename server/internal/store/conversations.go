package store

import (
	"context"
	"fmt"
	"time"
)

type Conversation struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Title     *string   `json:"title"`
	AvatarURL *string   `json:"avatar_url"`
	LastSeq   int64     `json:"last_seq"`
	CreatedBy *string   `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

type ConversationSummary struct {
	Conversation
	Unread      int64    `json:"unread"`
	LastMessage *Message `json:"last_message"`
	Members     []*User  `json:"members"`
	LastReadSeq int64    `json:"last_read_seq"`
}

func dmKey(a, b string) string {
	if a > b {
		a, b = b, a
	}
	return fmt.Sprintf("dm:%s:%s", a, b)
}

// CreateDM finds or creates the unique DM between two users.
func (s *Store) CreateDM(ctx context.Context, userA, userB string) (*Conversation, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var c Conversation
	err = tx.QueryRow(ctx, `
		INSERT INTO conversations (type, dm_key, created_by)
		VALUES ('dm', $1, $2)
		ON CONFLICT (dm_key) DO UPDATE SET dm_key = EXCLUDED.dm_key
		RETURNING id, type, title, avatar_url, last_seq, created_by, created_at`,
		dmKey(userA, userB), userA,
	).Scan(&c.ID, &c.Type, &c.Title, &c.AvatarURL, &c.LastSeq, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("upsert dm: %w", err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO conversation_members (conversation_id, user_id)
		VALUES ($1, $2), ($1, $3)
		ON CONFLICT DO NOTHING`, c.ID, userA, userB)
	if err != nil {
		return nil, fmt.Errorf("insert members: %w", err)
	}
	return &c, tx.Commit(ctx)
}

func (s *Store) IsMember(ctx context.Context, convID, userID string) (bool, error) {
	var ok bool
	err := s.Pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM conversation_members
			WHERE conversation_id = $1 AND user_id = $2
		)`, convID, userID).Scan(&ok)
	return ok, err
}

func (s *Store) MemberIDs(ctx context.Context, convID string) ([]string, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT user_id FROM conversation_members WHERE conversation_id = $1`, convID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (s *Store) Members(ctx context.Context, convID string) ([]*User, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT `+userCols+` FROM users u
		JOIN conversation_members m ON m.user_id = u.id
		WHERE m.conversation_id = $1`, convID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []*User
	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (s *Store) ConversationByID(ctx context.Context, id string) (*Conversation, error) {
	var c Conversation
	err := s.Pool.QueryRow(ctx, `
		SELECT id, type, title, avatar_url, last_seq, created_by, created_at
		FROM conversations WHERE id = $1`, id,
	).Scan(&c.ID, &c.Type, &c.Title, &c.AvatarURL, &c.LastSeq, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
