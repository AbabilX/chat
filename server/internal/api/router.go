package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"chat-backend/internal/auth"
	"chat-backend/internal/config"
	"chat-backend/internal/deliver"
	"chat-backend/internal/media"
	"chat-backend/internal/store"
	"chat-backend/internal/ws"
)

type Server struct {
	cfg     *config.Config
	store   *store.Store
	gateway *ws.Gateway
	deliver *deliver.Service
	media   *media.R2
}

func NewServer(cfg *config.Config, st *store.Store, gateway *ws.Gateway, svc *deliver.Service, r2 *media.R2) *Server {
	return &Server{cfg: cfg, store: st, gateway: gateway, deliver: svc, media: r2}
}

func (s *Server) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})

	r.Route("/v1", func(r chi.Router) {
		r.Post("/auth/signup", s.handleSignup)
		r.Post("/auth/login", s.handleLogin)
		r.Get("/ws", s.gateway.HandleWS)

		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware(s.cfg.JWTSecret))
			r.Get("/me", s.handleMe)
			r.Get("/users/search", s.handleUserSearch)
			r.Get("/conversations", s.handleConversationList)
			r.Get("/activity", s.handleActivity)
			r.Post("/conversations", s.handleCreateConversation)
			r.Get("/conversations/{id}/messages", s.handleMessages)
			r.Put("/messages/{id}/reaction", s.handleSetReaction)
			r.Delete("/messages/{id}/reaction", s.handleDeleteReaction)
			r.Put("/messages/{id}/save", s.handleSaveMessage)
			r.Delete("/messages/{id}/save", s.handleUnsaveMessage)
			r.Post("/messages/{id}/mark-unread", s.handleMarkMessageUnread)
			r.Post("/sync", s.handleSync)
			r.Post("/media/presign", s.handlePresign)
			r.Post("/push/register", s.handleRegisterPush)
			r.Post("/contacts/sync", s.handleContactsSync)
		})
	})

	return r
}
