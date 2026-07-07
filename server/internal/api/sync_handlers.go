package api

import (
	"net/http"

	"chat-backend/internal/auth"
	"chat-backend/internal/store"
	"chat-backend/internal/ws"
)

type syncRequest struct {
	Cursors map[string]int64 `json:"cursors"`
}

type syncResponse struct {
	Conversations []*store.ConversationSummary      `json:"conversations"`
	Messages      map[string][]*store.Message       `json:"messages"`
	Statuses      map[string][]*store.MessageStatus `json:"statuses"`
}

// handleSync is the reconnect catch-up: returns everything newer than the
// client's per-conversation cursors, marks it delivered, and notifies online
// senders their ticks advanced.
func (s *Server) handleSync(w http.ResponseWriter, r *http.Request) {
	var req syncRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	me := auth.UserID(r.Context())

	list, err := s.store.ConversationList(r.Context(), me)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}

	resp := syncResponse{
		Conversations: list,
		Messages:      map[string][]*store.Message{},
		Statuses:      map[string][]*store.MessageStatus{},
	}
	if resp.Conversations == nil {
		resp.Conversations = []*store.ConversationSummary{}
	}

	for _, conv := range list {
		cursor := req.Cursors[conv.ID]
		msgs, err := s.store.MessagesSince(r.Context(), conv.ID, cursor)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "sync failed")
			return
		}
		if len(msgs) > 0 {
			if err := s.store.FillMessageActions(r.Context(), me, msgs); err != nil {
				writeError(w, http.StatusInternalServerError, "sync failed")
				return
			}
			resp.Messages[conv.ID] = msgs
			s.markSyncDelivered(r, me, conv.ID, msgs)
		}

		statuses, err := s.store.StatusesFor(r.Context(), conv.ID, me)
		if err == nil && len(statuses) > 0 {
			resp.Statuses[conv.ID] = statuses
		}
	}

	writeJSON(w, http.StatusOK, resp)
}

// markSyncDelivered stamps delivery for fetched messages and pushes live
// receipt frames to their online senders.
func (s *Server) markSyncDelivered(r *http.Request, me, convID string, msgs []*store.Message) {
	maxSeq := int64(0)
	senders := map[string]bool{}
	for _, m := range msgs {
		if m.SenderID != me {
			if m.Seq > maxSeq {
				maxSeq = m.Seq
			}
			senders[m.SenderID] = true
		}
	}
	if maxSeq == 0 {
		return
	}
	if err := s.store.MarkDeliveredUpTo(r.Context(), convID, me, maxSeq); err != nil {
		return
	}
	frame := ws.ReceiptFrame(ws.ReceiptPayload{
		ConversationID: convID,
		UserID:         me,
		UpToSeq:        maxSeq,
		Status:         "delivered",
	})
	for sender := range senders {
		s.gateway.Hub().Send(sender, frame)
	}
}
