package ws

import (
	"encoding/json"

	"chat-backend/internal/store"
)

// Frame is the wire envelope for both directions.
type Frame struct {
	T string          `json:"t"`
	D json.RawMessage `json:"d,omitempty"`
}

// Inbound frame payloads (client → server).

type SendAttachment struct {
	ObjectKey string `json:"object_key"`
	MimeType  string `json:"mime_type"`
	Width     *int   `json:"width,omitempty"`
	Height    *int   `json:"height,omitempty"`
}

type SendPayload struct {
	ClientID       string          `json:"client_id"`
	ConversationID string          `json:"conversation_id"`
	ParentID       *string         `json:"parent_id,omitempty"`
	Kind           string          `json:"kind"`
	Body           string          `json:"body"`
	Mentions       []string        `json:"mentions,omitempty"`
	Attachment     *SendAttachment `json:"attachment,omitempty"`
}

type SeenPayload struct {
	ConversationID string `json:"conversation_id"`
	UpToSeq        int64  `json:"up_to_seq"`
}

type TypingPayload struct {
	ConversationID string `json:"conversation_id"`
	IsTyping       bool   `json:"is_typing"`
}

// Outbound frames (server → client).

func marshalFrame(t string, d any) []byte {
	raw, _ := json.Marshal(d)
	b, _ := json.Marshal(Frame{T: t, D: raw})
	return b
}

type AckPayload struct {
	ClientID  string `json:"client_id"`
	MessageID string `json:"message_id"`
	Seq       int64  `json:"seq"`
	CreatedAt string `json:"created_at"`
}

func AckFrame(p AckPayload) []byte { return marshalFrame("ack", p) }

func MessageFrame(m *store.Message, sender *store.User) []byte {
	return marshalFrame("message", map[string]any{
		"message": m,
		"sender":  sender,
	})
}

type ReceiptPayload struct {
	ConversationID string `json:"conversation_id"`
	UserID         string `json:"user_id"`
	UpToSeq        int64  `json:"up_to_seq"`
	Status         string `json:"status"` // delivered | seen
}

func ReceiptFrame(p ReceiptPayload) []byte { return marshalFrame("receipt", p) }

func TypingFrame(convID, userID string, isTyping bool) []byte {
	return marshalFrame("typing", map[string]any{
		"conversation_id": convID,
		"user_id":         userID,
		"is_typing":       isTyping,
	})
}

func ConvFrame(summary any) []byte { return marshalFrame("conv", summary) }

func ErrorFrame(clientID, code, message string) []byte {
	return marshalFrame("error", map[string]string{
		"client_id": clientID,
		"code":      code,
		"message":   message,
	})
}
