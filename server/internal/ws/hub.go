package ws

import (
	"sync"
)

// Hub tracks live connections per user. One user may have several devices.
type Hub struct {
	mu    sync.RWMutex
	conns map[string]map[*Client]struct{}
}

func NewHub() *Hub {
	return &Hub{conns: make(map[string]map[*Client]struct{})}
}

func (h *Hub) register(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	set, ok := h.conns[c.userID]
	if !ok {
		set = make(map[*Client]struct{})
		h.conns[c.userID] = set
	}
	set[c] = struct{}{}
}

func (h *Hub) unregister(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if set, ok := h.conns[c.userID]; ok {
		delete(set, c)
		if len(set) == 0 {
			delete(h.conns, c.userID)
		}
	}
}

// IsOnline reports whether the user has at least one live connection.
func (h *Hub) IsOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.conns[userID]) > 0
}

// Send queues a frame to every connection of a user.
// Returns true if at least one connection accepted it.
func (h *Hub) Send(userID string, frame []byte) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	sent := false
	for c := range h.conns[userID] {
		if c.trySend(frame) {
			sent = true
		}
	}
	return sent
}

// SendMany fans a frame out to several users, returning those that received it.
func (h *Hub) SendMany(userIDs []string, frame []byte) []string {
	var reached []string
	for _, id := range userIDs {
		if h.Send(id, frame) {
			reached = append(reached, id)
		}
	}
	return reached
}
