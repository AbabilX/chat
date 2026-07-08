package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	Phone        string    `json:"phone"`
	DisplayName  string    `json:"display_name"`
	AvatarURL    *string   `json:"avatar_url"`
	CoverURL     *string   `json:"cover_url"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

var ErrNotFound = errors.New("not found")

const userCols = `id, email, username, phone, display_name, avatar_url, cover_url, password_hash, created_at`

func scanUser(row pgx.Row) (*User, error) {
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.Username, &u.Phone, &u.DisplayName,
		&u.AvatarURL, &u.CoverURL, &u.PasswordHash, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) CreateUser(ctx context.Context, email, username, phone, passwordHash, displayName string) (*User, error) {
	row := s.Pool.QueryRow(ctx, `
		INSERT INTO users (email, username, phone, password_hash, display_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+userCols,
		email, username, phone, passwordHash, displayName)
	return scanUser(row)
}

func (s *Store) UserByEmail(ctx context.Context, email string) (*User, error) {
	row := s.Pool.QueryRow(ctx,
		`SELECT `+userCols+` FROM users WHERE lower(email) = lower($1)`, email)
	return scanUser(row)
}

func (s *Store) UserByID(ctx context.Context, id string) (*User, error) {
	row := s.Pool.QueryRow(ctx, `SELECT `+userCols+` FROM users WHERE id = $1`, id)
	return scanUser(row)
}

func (s *Store) SearchUsers(ctx context.Context, query string, excludeID string, limit int) ([]*User, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT `+userCols+` FROM users
		WHERE (username ILIKE $1 || '%' OR email ILIKE $1 || '%' OR display_name ILIKE $1 || '%')
		  AND id != $2
		ORDER BY username LIMIT $3`, query, excludeID, limit)
	if err != nil {
		return nil, fmt.Errorf("search users: %w", err)
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
