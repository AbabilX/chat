package store

import (
	"context"
)

func (s *Store) SavePushToken(ctx context.Context, userID, token, deviceID string) error {
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO push_tokens (user_id, token, device_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, device_id)
		DO UPDATE SET token = EXCLUDED.token, updated_at = now()`,
		userID, token, deviceID)
	return err
}

func (s *Store) PushTokens(ctx context.Context, userID string) ([]string, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT token FROM push_tokens WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tokens []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return nil, err
		}
		tokens = append(tokens, t)
	}
	return tokens, rows.Err()
}

func (s *Store) DeletePushToken(ctx context.Context, token string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM push_tokens WHERE token = $1`, token)
	return err
}
