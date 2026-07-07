package push

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

const expoURL = "https://exp.host/--/api/v2/push/send"
const batchSize = 100

type Notification struct {
	To        []string          `json:"to"`
	Title     string            `json:"title"`
	Body      string            `json:"body"`
	Data      map[string]string `json:"data,omitempty"`
	ChannelID string            `json:"channelId,omitempty"`
	Sound     string            `json:"sound,omitempty"`
}

type Client struct {
	http *http.Client
}

func NewClient() *Client {
	return &Client{http: &http.Client{Timeout: 10 * time.Second}}
}

// Send fires a notification at a set of Expo push tokens, batching per the
// Expo API limit. Errors are logged, not returned — push is best-effort.
func (c *Client) Send(ctx context.Context, tokens []string, title, body string, data map[string]string) {
	for start := 0; start < len(tokens); start += batchSize {
		end := min(start+batchSize, len(tokens))
		n := Notification{
			To:        tokens[start:end],
			Title:     title,
			Body:      body,
			Data:      data,
			ChannelID: "messages",
			Sound:     "default",
		}
		if err := c.post(ctx, n); err != nil {
			log.Printf("expo push failed: %v", err)
		}
	}
}

func (c *Client) post(ctx context.Context, n Notification) error {
	payload, err := json.Marshal(n)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, expoURL, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		return fmt.Errorf("expo push status %d", res.StatusCode)
	}
	return nil
}
