package store

import (
	"context"
	"fmt"
)

type Reaction struct {
	Emoji   string `json:"emoji"`
	Count   int    `json:"count"`
	Reacted bool   `json:"reacted"`
}

func (s *Store) FillMessageActions(ctx context.Context, viewerID string, msgs []*Message) error {
	for _, msg := range msgs {
		msg.Reactions = []Reaction{}
		msg.Saved = false

		rows, err := s.Pool.Query(ctx, `
			SELECT emoji, COUNT(*)::int, BOOL_OR(user_id = $2::uuid) AS reacted
			FROM message_reactions
			WHERE message_id = $1
			GROUP BY emoji
			ORDER BY COUNT(*) DESC, MIN(created_at) ASC`, msg.ID, viewerID)
		if err != nil {
			return fmt.Errorf("load reactions: %w", err)
		}
		for rows.Next() {
			var reaction Reaction
			if err := rows.Scan(&reaction.Emoji, &reaction.Count, &reaction.Reacted); err != nil {
				rows.Close()
				return err
			}
			msg.Reactions = append(msg.Reactions, reaction)
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return err
		}
		rows.Close()

		err = s.Pool.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1 FROM saved_messages
				WHERE user_id = $1 AND message_id = $2
			)`, viewerID, msg.ID).Scan(&msg.Saved)
		if err != nil {
			return fmt.Errorf("load saved state: %w", err)
		}
	}
	return nil
}

func (s *Store) SetReaction(ctx context.Context, messageID, userID, emoji string) error {
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO message_reactions (message_id, user_id, emoji)
		VALUES ($1, $2, $3)
		ON CONFLICT (message_id, user_id)
		DO UPDATE SET emoji = EXCLUDED.emoji, created_at = now()`,
		messageID, userID, emoji)
	return err
}

func (s *Store) DeleteReaction(ctx context.Context, messageID, userID string) error {
	_, err := s.Pool.Exec(ctx,
		`DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2`,
		messageID, userID)
	return err
}

func (s *Store) SetSavedMessage(ctx context.Context, messageID, userID string, saved bool) error {
	if saved {
		_, err := s.Pool.Exec(ctx, `
			INSERT INTO saved_messages (user_id, message_id)
			VALUES ($1, $2)
			ON CONFLICT (user_id, message_id) DO NOTHING`,
			userID, messageID)
		return err
	}

	_, err := s.Pool.Exec(ctx,
		`DELETE FROM saved_messages WHERE user_id = $1 AND message_id = $2`,
		userID, messageID)
	return err
}
