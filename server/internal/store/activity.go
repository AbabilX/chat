package store

import (
	"context"
	"fmt"
)

type ActivityItem struct {
	Kind    string   `json:"kind"` // "mention" | "thread"
	Message *Message `json:"message"`
	Unread  bool     `json:"unread"`
}

// Activity returns messages that mention the user, or replies to a thread
// they started or took part in, newest first, across every conversation
// they're a member of.
func (s *Store) Activity(ctx context.Context, userID string, limit int) ([]*ActivityItem, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT m.id, m.conversation_id, m.seq, m.sender_id, m.parent_id, m.kind, m.body,
		       m.mentions, m.reply_count, m.created_at, (m.seq > cm.last_read_seq) AS unread
		FROM messages m
		JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = $1
		WHERE m.sender_id != $1
		AND (
			$1 = ANY(m.mentions)
			OR (m.parent_id IS NOT NULL AND (
				EXISTS (SELECT 1 FROM messages p WHERE p.id = m.parent_id AND p.sender_id = $1)
				OR EXISTS (SELECT 1 FROM messages r WHERE r.parent_id = m.parent_id AND r.sender_id = $1)
			))
		)
		ORDER BY m.created_at DESC
		LIMIT $2`, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("activity: %w", err)
	}
	defer rows.Close()

	var items []*ActivityItem
	var msgs []*Message
	for rows.Next() {
		var m Message
		var unread bool
		if err := rows.Scan(&m.ID, &m.ConversationID, &m.Seq, &m.SenderID, &m.ParentID,
			&m.Kind, &m.Body, &m.Mentions, &m.ReplyCount, &m.CreatedAt, &unread); err != nil {
			return nil, err
		}
		if m.Mentions == nil {
			m.Mentions = []string{}
		}
		kind := "thread"
		for _, id := range m.Mentions {
			if id == userID {
				kind = "mention"
				break
			}
		}
		items = append(items, &ActivityItem{Kind: kind, Message: &m, Unread: unread})
		msgs = append(msgs, &m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if err := s.fillAttachments(ctx, msgs); err != nil {
		return nil, err
	}
	return items, nil
}
