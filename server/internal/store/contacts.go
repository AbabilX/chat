package store

import (
	"context"
)

// UsersByPhones returns registered users whose phone matches any of the given
// E.164-normalized numbers (excluding the requester).
func (s *Store) UsersByPhones(ctx context.Context, phones []string, excludeID string) ([]*User, error) {
	if len(phones) == 0 {
		return nil, nil
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT `+userCols+` FROM users
		WHERE phone = ANY($1) AND id != $2`, phones, excludeID)
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
