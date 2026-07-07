package deliver

import (
	"context"
	"fmt"
	"time"

	"chat-backend/internal/push"
	"chat-backend/internal/store"
	"chat-backend/internal/ws"
)

// Service implements ws.Deliverer: persists messages, fans them out to online
// members, and records delivery/seen receipts. Offline members get an Expo
// push notification.
type Service struct {
	store *store.Store
	hub   *ws.Hub
	push  *push.Client
}

func New(st *store.Store, hub *ws.Hub, pc *push.Client) *Service {
	return &Service{store: st, hub: hub, push: pc}
}

func (s *Service) Send(ctx context.Context, senderID string, p ws.SendPayload) (*store.Message, error) {
	if p.ClientID == "" || p.ConversationID == "" {
		return nil, fmt.Errorf("client_id and conversation_id required")
	}
	if p.Kind == "" {
		p.Kind = "text"
	}
	if p.Kind == "text" && p.Body == "" {
		return nil, fmt.Errorf("empty message")
	}
	ok, err := s.store.IsMember(ctx, p.ConversationID, senderID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("not a member of this conversation")
	}

	var attachment *store.NewAttachment
	if p.Attachment != nil {
		attachment = &store.NewAttachment{
			ObjectKey: p.Attachment.ObjectKey,
			MimeType:  p.Attachment.MimeType,
			Width:     p.Attachment.Width,
			Height:    p.Attachment.Height,
		}
	}
	msg, created, err := s.store.InsertMessage(ctx, store.NewMessage{
		ID:             p.ClientID,
		ConversationID: p.ConversationID,
		SenderID:       senderID,
		ParentID:       p.ParentID,
		Kind:           p.Kind,
		Body:           p.Body,
		Mentions:       p.Mentions,
		Attachment:     attachment,
	})
	if err != nil {
		return nil, err
	}
	if created {
		s.fanOut(ctx, msg, senderID)
	}
	return msg, nil
}

func (s *Service) fanOut(ctx context.Context, msg *store.Message, senderID string) {
	sender, err := s.store.UserByID(ctx, senderID)
	if err != nil {
		return
	}
	members, err := s.store.MemberIDs(ctx, msg.ConversationID)
	if err != nil {
		return
	}

	frame := ws.MessageFrame(msg, sender)
	var offline []string
	for _, uid := range members {
		if uid == senderID {
			continue
		}
		if s.hub.Send(uid, frame) {
			if err := s.store.MarkDelivered(ctx, msg.ID, uid); err == nil {
				s.hub.Send(senderID, ws.ReceiptFrame(ws.ReceiptPayload{
					ConversationID: msg.ConversationID,
					UserID:         uid,
					UpToSeq:        msg.Seq,
					Status:         "delivered",
				}))
			}
		} else {
			offline = append(offline, uid)
		}
	}
	// Offline members get the message itself via /v1/sync catch-up; the push
	// notification just wakes them up.
	if len(offline) > 0 && msg.Kind != "system" {
		go s.notifyOffline(offline, sender, msg)
	}
}

func (s *Service) notifyOffline(userIDs []string, sender *store.User, msg *store.Message) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	preview := msg.Body
	if msg.Kind == "image" {
		preview = "📷 Photo"
	}
	var tokens []string
	for _, uid := range userIDs {
		t, err := s.store.PushTokens(ctx, uid)
		if err == nil {
			tokens = append(tokens, t...)
		}
	}
	if len(tokens) == 0 {
		return
	}
	s.push.Send(ctx, tokens, sender.DisplayName, preview, map[string]string{
		"conversation_id": msg.ConversationID,
	})
}

func (s *Service) MarkSeen(ctx context.Context, userID string, p ws.SeenPayload) error {
	ok, err := s.store.IsMember(ctx, p.ConversationID, userID)
	if err != nil || !ok {
		return fmt.Errorf("not a member")
	}
	if err := s.store.MarkSeenUpTo(ctx, p.ConversationID, userID, p.UpToSeq); err != nil {
		return err
	}
	members, err := s.store.MemberIDs(ctx, p.ConversationID)
	if err != nil {
		return err
	}
	frame := ws.ReceiptFrame(ws.ReceiptPayload{
		ConversationID: p.ConversationID,
		UserID:         userID,
		UpToSeq:        p.UpToSeq,
		Status:         "seen",
	})
	for _, uid := range members {
		if uid != userID {
			s.hub.Send(uid, frame)
		}
	}
	return nil
}
