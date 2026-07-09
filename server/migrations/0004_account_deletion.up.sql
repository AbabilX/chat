ALTER TABLE users ADD COLUMN deletion_requested_at TIMESTAMPTZ;
CREATE INDEX users_deletion_pending_idx ON users (deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;

-- Account purge deletes/joins messages by sender_id; without this the reaper
-- seq-scans the whole messages table per deleted user (and the FK back to
-- users(id) had no supporting index either).
CREATE INDEX messages_sender_idx ON messages (sender_id);
