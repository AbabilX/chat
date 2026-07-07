package store

import (
	"context"
)

// MessagesSince returns every message in a conversation with seq greater than
// afterSeq, oldest first, including thread replies.
func (s *Store) MessagesSince(ctx context.Context, convID string, afterSeq int64) ([]*Message, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT `+msgCols+` FROM messages
		WHERE conversation_id = $1 AND seq > $2
		ORDER BY seq ASC`, convID, afterSeq)
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
