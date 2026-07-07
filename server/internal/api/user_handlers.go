package api

import (
	"net/http"
	"strings"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
)

func (s *Server) handleUserSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(query) < 2 {
		writeJSON(w, http.StatusOK, map[string][]*store.User{"users": {}})
		return
	}
	users, err := s.store.SearchUsers(r.Context(), query, auth.UserID(r.Context()), 20)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "search failed")
		return
	}
	if users == nil {
		users = []*store.User{}
	}
	writeJSON(w, http.StatusOK, map[string][]*store.User{"users": users})
}
