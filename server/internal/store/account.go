package store

import (
	"context"
	"time"
)

// ScheduleDeletion marks the account for deletion, starting the grace period.
// Idempotent: re-requesting keeps the original timestamp so the countdown
// isn't extended by repeated taps.
func (s *Store) ScheduleDeletion(ctx context.Context, userID string, at time.Time) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE users SET deletion_requested_at = $2
		WHERE id = $1 AND deletion_requested_at IS NULL`, userID, at)
	return err
}

// CancelDeletion clears a pending deletion (e.g. the user logged back in
// during the grace period).
func (s *Store) CancelDeletion(ctx context.Context, userID string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE users SET deletion_requested_at = NULL WHERE id = $1`, userID)
	return err
}

// UsersPendingPurge returns users whose grace period elapsed on or before the
// cutoff and are ready to be hard-deleted by the reaper.
func (s *Store) UsersPendingPurge(ctx context.Context, cutoff time.Time) ([]*User, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT `+userCols+` FROM users
		 WHERE deletion_requested_at IS NOT NULL AND deletion_requested_at <= $1`, cutoff)
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

// UserAttachmentKeys returns R2 object keys for every attachment on messages
// the user sent, so callers can purge them from storage before deletion.
func (s *Store) UserAttachmentKeys(ctx context.Context, userID string) ([]string, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT a.object_key FROM attachments a
		JOIN messages m ON m.id = a.message_id
		WHERE m.sender_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var keys []string
	for rows.Next() {
		var k string
		if err := rows.Scan(&k); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

// DeleteAccount hard-deletes a user and everything they own. Conversations
// they created are kept but detached (created_by set NULL); their messages
// are deleted outright, cascading to attachments/receipts/reactions/saves on
// those messages; the final users delete cascades every remaining
// user-scoped row (contacts, memberships, push tokens, receipts/reactions/
// saves on other users' messages).
func (s *Store) DeleteAccount(ctx context.Context, userID string) error {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `UPDATE conversations SET created_by = NULL WHERE created_by = $1`, userID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM messages WHERE sender_id = $1`, userID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM users WHERE id = $1`, userID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
