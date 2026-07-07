package ws

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"chat-backend/internal/auth"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = 50 * time.Second
	maxMessageSize = 64 * 1024
	sendBuffer     = 64
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	// Mobile clients have no meaningful Origin; auth is via JWT.
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Client struct {
	userID  string
	conn    *websocket.Conn
	send    chan []byte
	gateway *Gateway
}

func (c *Client) trySend(frame []byte) bool {
	select {
	case c.send <- frame:
		return true
	default:
		return false // slow consumer; catch-up sync will recover
	}
}

// HandleWS upgrades the connection after validating ?token=<jwt>.
func (g *Gateway) HandleWS(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.VerifyToken(g.jwtSecret, r.URL.Query().Get("token"))
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &Client{userID: userID, conn: conn, send: make(chan []byte, sendBuffer), gateway: g}
	g.hub.register(client)
	go client.writePump()
	go client.readPump()
	log.Printf("ws connect user=%s", userID)
}

func (c *Client) readPump() {
	// send is never closed: trySend may race a disconnect, and writing to a
	// closed channel would panic. writePump exits via conn.Close write error.
	defer func() {
		c.gateway.hub.unregister(c)
		c.conn.Close()
		log.Printf("ws disconnect user=%s", c.userID)
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})
	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			return
		}
		c.gateway.dispatch(c, data)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case frame, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, frame); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
