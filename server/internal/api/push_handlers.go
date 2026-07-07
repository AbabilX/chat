package api

import (
	"net/http"

	"chat-backend/internal/auth"
)

type registerPushRequest struct {
	Token    string `json:"token"`
	DeviceID string `json:"device_id"`
}

func (s *Server) handleRegisterPush(w http.ResponseWriter, r *http.Request) {
	var req registerPushRequest
	if err := decodeJSON(r, &req); err != nil || req.Token == "" || req.DeviceID == "" {
		writeError(w, http.StatusBadRequest, "token and device_id required")
		return
	}
	if err := s.store.SavePushToken(r.Context(), auth.UserID(r.Context()), req.Token, req.DeviceID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not save token")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
