package api

import (
	"net/http"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
)

func (s *Server) handleActivity(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.Activity(r.Context(), auth.UserID(r.Context()), 50)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "activity failed")
		return
	}
	if items == nil {
		items = []*store.ActivityItem{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}
