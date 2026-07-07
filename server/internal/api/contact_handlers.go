package api

import (
	"net/http"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
)

type contactsSyncRequest struct {
	Phones []string `json:"phones"`
}

// handleContactsSync matches the device's phone numbers against registered
// users so the client can show who is already on the app.
func (s *Server) handleContactsSync(w http.ResponseWriter, r *http.Request) {
	var req contactsSyncRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if len(req.Phones) > 5000 {
		req.Phones = req.Phones[:5000]
	}
	normalized := make([]string, 0, len(req.Phones))
	for _, p := range req.Phones {
		if n := normalizePhone(p); len(n) >= 7 {
			normalized = append(normalized, n)
		}
	}
	users, err := s.store.UsersByPhones(r.Context(), normalized, auth.UserID(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "sync failed")
		return
	}
	if users == nil {
		users = []*store.User{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"users": users})
}
