package api

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
	"chat-backend/internal/ws"
)

func (s *Server) handleConversationList(w http.ResponseWriter, r *http.Request) {
	list, err := s.store.ConversationList(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if list == nil {
		list = []*store.ConversationSummary{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"conversations": list})
}

type createConversationRequest struct {
	Type      string   `json:"type"`
	UserID    string   `json:"user_id"`
	Title     string   `json:"title"`
	MemberIDs []string `json:"member_ids"`
}

func (s *Server) handleCreateConversation(w http.ResponseWriter, r *http.Request) {
	var req createConversationRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	me := auth.UserID(r.Context())

	switch req.Type {
	case "dm":
		if req.UserID == "" || req.UserID == me {
			writeError(w, http.StatusBadRequest, "user_id required")
			return
		}
		if _, err := s.store.UserByID(r.Context(), req.UserID); err != nil {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		conv, err := s.store.CreateDM(r.Context(), me, req.UserID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "could not create conversation")
			return
		}
		s.respondConversation(w, r, conv.ID)
	case "group":
		if req.Title == "" || len(req.MemberIDs) == 0 {
			writeError(w, http.StatusBadRequest, "title and member_ids required")
			return
		}
		conv, err := s.store.CreateGroup(r.Context(), me, req.Title, req.MemberIDs)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "could not create group")
			return
		}
		s.announceGroup(r, conv.ID, me)
		s.respondConversation(w, r, conv.ID)
	default:
		writeError(w, http.StatusBadRequest, "unsupported type")
	}
}

// announceGroup posts a system message and pings members' sockets so their
// apps pull the new conversation.
func (s *Server) announceGroup(r *http.Request, convID, creatorID string) {
	creator, err := s.store.UserByID(r.Context(), creatorID)
	name := "Someone"
	if err == nil {
		name = creator.DisplayName
	}
	_, err = s.deliver.Send(r.Context(), creatorID, ws.SendPayload{
		ClientID:       uuid.NewString(),
		ConversationID: convID,
		Kind:           "system",
		Body:           name + " created the group",
	})
	if err != nil {
		return
	}
	members, err := s.store.MemberIDs(r.Context(), convID)
	if err != nil {
		return
	}
	frame := ws.ConvFrame(map[string]string{"conversation_id": convID})
	for _, uid := range members {
		s.gateway.Hub().Send(uid, frame)
	}
}

func (s *Server) respondConversation(w http.ResponseWriter, r *http.Request, convID string) {
	conv, err := s.store.ConversationByID(r.Context(), convID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "load failed")
		return
	}
	members, err := s.store.Members(r.Context(), convID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "load failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"conversation": conv,
		"members":      members,
	})
}

func (s *Server) handleMessages(w http.ResponseWriter, r *http.Request) {
	convID := chi.URLParam(r, "id")
	me := auth.UserID(r.Context())

	ok, err := s.store.IsMember(r.Context(), convID, me)
	if err != nil || !ok {
		writeError(w, http.StatusForbidden, "not a member")
		return
	}

	beforeSeq, _ := strconv.ParseInt(r.URL.Query().Get("before_seq"), 10, 64)
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	msgs, err := s.store.History(r.Context(), convID, beforeSeq, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "history failed")
		return
	}
	if err := s.store.FillMessageActions(r.Context(), me, msgs); err != nil {
		writeError(w, http.StatusInternalServerError, "history failed")
		return
	}
	if msgs == nil {
		msgs = []*store.Message{}
	}

	statuses, err := s.store.StatusesFor(r.Context(), convID, me)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "statuses failed")
		return
	}
	if statuses == nil {
		statuses = []*store.MessageStatus{}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"messages": msgs,
		"statuses": statuses,
	})
}
