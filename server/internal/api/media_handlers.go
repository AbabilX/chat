package api

import (
	"net/http"
)

type presignRequest struct {
	Mime string `json:"mime"`
}

func (s *Server) handlePresign(w http.ResponseWriter, r *http.Request) {
	if s.media == nil {
		writeError(w, http.StatusServiceUnavailable, "media storage not configured")
		return
	}
	var req presignRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	uploadURL, objectKey, publicURL, err := s.media.PresignUpload(r.Context(), req.Mime)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"upload_url": uploadURL,
		"object_key": objectKey,
		"public_url": publicURL,
	})
}
