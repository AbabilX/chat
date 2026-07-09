DROP INDEX IF EXISTS messages_sender_idx;
DROP INDEX IF EXISTS users_deletion_pending_idx;
ALTER TABLE users DROP COLUMN IF EXISTS deletion_requested_at;
