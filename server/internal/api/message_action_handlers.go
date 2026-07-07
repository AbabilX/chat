package api

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
)

type reactionRequest struct {
	Emoji string `json:"emoji"`
}

func (s *Server) handleSetReaction(w http.ResponseWriter, r *http.Request) {
	msg, me, ok := s.requireMessageMember(w, r)
	if !ok {
		return
	}

	var req reactionRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	req.Emoji = strings.TrimSpace(req.Emoji)
	if req.Emoji == "" || len([]rune(req.Emoji)) > 8 {
		writeError(w, http.StatusBadRequest, "emoji required")
		return
	}

	if err := s.store.SetReaction(r.Context(), msg.ID, me, req.Emoji); err != nil {
		writeError(w, http.StatusInternalServerError, "reaction failed")
		return
	}
	s.respondMessageAction(w, r, msg, me)
}

func (s *Server) handleDeleteReaction(w http.ResponseWriter, r *http.Request) {
	msg, me, ok := s.requireMessageMember(w, r)
	if !ok {
		return
	}
	if err := s.store.DeleteReaction(r.Context(), msg.ID, me); err != nil {
		writeError(w, http.StatusInternalServerError, "reaction failed")
		return
	}
	s.respondMessageAction(w, r, msg, me)
}

func (s *Server) handleSaveMessage(w http.ResponseWriter, r *http.Request) {
	msg, me, ok := s.requireMessageMember(w, r)
	if !ok {
		return
	}
	if err := s.store.SetSavedMessage(r.Context(), msg.ID, me, true); err != nil {
		writeError(w, http.StatusInternalServerError, "save failed")
		return
	}
	s.respondMessageAction(w, r, msg, me)
}

func (s *Server) handleUnsaveMessage(w http.ResponseWriter, r *http.Request) {
	msg, me, ok := s.requireMessageMember(w, r)
	if !ok {
		return
	}
	if err := s.store.SetSavedMessage(r.Context(), msg.ID, me, false); err != nil {
		writeError(w, http.StatusInternalServerError, "save failed")
		return
	}
	s.respondMessageAction(w, r, msg, me)
}

func (s *Server) handleMarkMessageUnread(w http.ResponseWriter, r *http.Request) {
	msg, me, ok := s.requireMessageMember(w, r)
	if !ok {
		return
	}
	if err := s.store.MarkUnreadFrom(r.Context(), msg.ConversationID, me, msg.Seq); err != nil {
		writeError(w, http.StatusInternalServerError, "mark unread failed")
		return
	}
	s.respondMessageAction(w, r, msg, me)
}

func (s *Server) requireMessageMember(w http.ResponseWriter, r *http.Request) (*store.Message, string, bool) {
	me := auth.UserID(r.Context())
	msgID := chi.URLParam(r, "id")
	if msgID == "" {
		writeError(w, http.StatusBadRequest, "message id required")
		return nil, "", false
	}

	msg, err := s.store.MessageByID(r.Context(), msgID)
	if err != nil {
		writeError(w, http.StatusNotFound, "message not found")
		return nil, "", false
	}
	ok, err := s.store.IsMember(r.Context(), msg.ConversationID, me)
	if err != nil || !ok {
		writeError(w, http.StatusForbidden, "not a member")
		return nil, "", false
	}
	return msg, me, true
}

func (s *Server) respondMessageAction(w http.ResponseWriter, r *http.Request, msg *store.Message, viewerID string) {
	msgs := []*store.Message{msg}
	if err := s.store.FillMessageActions(r.Context(), viewerID, msgs); err != nil {
		writeError(w, http.StatusInternalServerError, "load failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"message_id":      msg.ID,
		"conversation_id": msg.ConversationID,
		"seq":             msg.Seq,
		"reactions":       msg.Reactions,
		"saved":           msg.Saved,
	})
}
