package store

import "context"

// UpdateProfile sets avatar and/or cover URLs. A nil pointer leaves that
// column unchanged, so callers can update just one field at a time.
func (s *Store) UpdateProfile(ctx context.Context, id string, avatarURL, coverURL *string) (*User, error) {
	row := s.Pool.QueryRow(ctx, `
		UPDATE users SET
		  avatar_url = COALESCE($2, avatar_url),
		  cover_url  = COALESCE($3, cover_url)
		WHERE id = $1
		RETURNING `+userCols, id, avatarURL, coverURL)
	return scanUser(row)
}
