package api

import (
	"net/http"

	"chat-backend/internal/auth"
)

type updateMeRequest struct {
	AvatarURL *string `json:"avatar_url"`
	CoverURL  *string `json:"cover_url"`
}

// handleUpdateMe patches the current user's avatar and/or cover photo. The
// client uploads the file to R2 first, then sends the resulting public URL.
func (s *Server) handleUpdateMe(w http.ResponseWriter, r *http.Request) {
	var req updateMeRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	user, err := s.store.UpdateProfile(r.Context(), auth.UserID(r.Context()), req.AvatarURL, req.CoverURL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "update failed")
		return
	}
	writeJSON(w, http.StatusOK, user)
}
