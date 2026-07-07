package ws

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"chat-backend/internal/store"
)

// Deliverer persists and fans out messages; implemented by internal/deliver.
type Deliverer interface {
	Send(ctx context.Context, senderID string, p SendPayload) (*store.Message, error)
	MarkSeen(ctx context.Context, userID string, p SeenPayload) error
}

type Gateway struct {
	hub       *Hub
	store     *store.Store
	deliver   Deliverer
	jwtSecret string
}

func NewGateway(hub *Hub, st *store.Store, deliver Deliverer, jwtSecret string) *Gateway {
	return &Gateway{hub: hub, store: st, deliver: deliver, jwtSecret: jwtSecret}
}

func (g *Gateway) Hub() *Hub { return g.hub }

func (g *Gateway) dispatch(c *Client, data []byte) {
	var frame Frame
	if err := json.Unmarshal(data, &frame); err != nil {
		c.trySend(ErrorFrame("", "bad_frame", "invalid json"))
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	switch frame.T {
	case "send":
		g.handleSend(ctx, c, frame.D)
	case "seen":
		g.handleSeen(ctx, c, frame.D)
	case "typing":
		g.handleTyping(ctx, c, frame.D)
	default:
		c.trySend(ErrorFrame("", "unknown_type", frame.T))
	}
}

func (g *Gateway) handleSend(ctx context.Context, c *Client, raw json.RawMessage) {
	var p SendPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		c.trySend(ErrorFrame("", "bad_payload", "invalid send payload"))
		return
	}
	msg, err := g.deliver.Send(ctx, c.userID, p)
	if err != nil {
		log.Printf("send failed user=%s conv=%s: %v", c.userID, p.ConversationID, err)
		c.trySend(ErrorFrame(p.ClientID, "send_failed", err.Error()))
		return
	}
	c.trySend(AckFrame(AckPayload{
		ClientID:  p.ClientID,
		MessageID: msg.ID,
		Seq:       msg.Seq,
		CreatedAt: msg.CreatedAt.Format(time.RFC3339Nano),
	}))
}

func (g *Gateway) handleSeen(ctx context.Context, c *Client, raw json.RawMessage) {
	var p SeenPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return
	}
	if err := g.deliver.MarkSeen(ctx, c.userID, p); err != nil {
		log.Printf("seen failed user=%s conv=%s: %v", c.userID, p.ConversationID, err)
	}
}

func (g *Gateway) handleTyping(ctx context.Context, c *Client, raw json.RawMessage) {
	var p TypingPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return
	}
	ok, err := g.store.IsMember(ctx, p.ConversationID, c.userID)
	if err != nil || !ok {
		return
	}
	members, err := g.store.MemberIDs(ctx, p.ConversationID)
	if err != nil {
		return
	}
	frame := TypingFrame(p.ConversationID, c.userID, p.IsTyping)
	for _, id := range members {
		if id != c.userID {
			g.hub.Send(id, frame)
		}
	}
}
