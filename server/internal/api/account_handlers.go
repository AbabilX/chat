package api

import (
	"net/http"
	"time"

	"chat-backend/internal/auth"
	"chat-backend/internal/reaper"
)

// handleDeleteMe schedules the caller's account for deletion. The account
// enters a 7-day grace period during which logging back in cancels it; a
// background reaper permanently purges DB rows and R2 objects once the grace
// period elapses.
func (s *Server) handleDeleteMe(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.UserID(ctx)

	if err := s.store.ScheduleDeletion(ctx, userID, time.Now()); err != nil {
		writeError(w, http.StatusInternalServerError, "could not schedule deletion")
		return
	}

	user, err := s.store.UserByID(ctx, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "lookup failed")
		return
	}

	scheduledFor := time.Now().Add(reaper.Grace)
	if user.DeletionRequestedAt != nil {
		scheduledFor = user.DeletionRequestedAt.Add(reaper.Grace)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scheduled":     true,
		"purge_at":      scheduledFor,
		"grace_seconds": int(reaper.Grace.Seconds()),
	})
}
