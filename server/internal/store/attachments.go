package store

import (
	"context"
)

type Attachment struct {
	ObjectKey string `json:"object_key"`
	MimeType  string `json:"mime_type"`
	Width     *int   `json:"width"`
	Height    *int   `json:"height"`
	URL       string `json:"url"` // filled by the API layer from R2 public URL
}

type NewAttachment struct {
	ObjectKey string
	MimeType  string
	Width     *int
	Height    *int
}

// SetPublicURLBase configures the CDN base used to build attachment URLs.
func (s *Store) SetPublicURLBase(base string) {
	s.publicURLBase = base
}

func (s *Store) attachmentURL(objectKey string) string {
	if s.publicURLBase == "" {
		return ""
	}
	return s.publicURLBase + "/" + objectKey
}

func (s *Store) insertAttachment(ctx context.Context, messageID string, a NewAttachment) error {
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO attachments (message_id, object_key, mime_type, width, height)
		VALUES ($1, $2, $3, $4, $5)`,
		messageID, a.ObjectKey, a.MimeType, a.Width, a.Height)
	return err
}

// fillAttachments loads attachment rows for any image messages in the slice.
func (s *Store) fillAttachments(ctx context.Context, msgs []*Message) error {
	var ids []string
	byID := map[string]*Message{}
	for _, m := range msgs {
		if m.Kind == "image" {
			ids = append(ids, m.ID)
			byID[m.ID] = m
		}
	}
	if len(ids) == 0 {
		return nil
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT message_id, object_key, mime_type, width, height
		FROM attachments WHERE message_id = ANY($1)`, ids)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var msgID string
		var a Attachment
		if err := rows.Scan(&msgID, &a.ObjectKey, &a.MimeType, &a.Width, &a.Height); err != nil {
			return err
		}
		if m := byID[msgID]; m != nil {
			a.URL = s.attachmentURL(a.ObjectKey)
			m.Attachment = &a
		}
	}
	return rows.Err()
}
