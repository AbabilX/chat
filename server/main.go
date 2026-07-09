package main

import (
	"context"
	"embed"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/joho/godotenv"

	"chat-backend/internal/api"
	"chat-backend/internal/config"
	"chat-backend/internal/deliver"
	"chat-backend/internal/media"
	"chat-backend/internal/push"
	"chat-backend/internal/reaper"
	"chat-backend/internal/store"
	"chat-backend/internal/ws"
)

//go:embed migrations/*.sql
var migrations embed.FS

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	if err := store.Migrate(migrations, cfg.DatabaseURL); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	log.Println("migrations up to date")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	st, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("store: %v", err)
	}
	defer st.Close()

	r2, err := media.New(cfg)
	if err != nil {
		log.Printf("media storage disabled: %v", err)
	} else {
		st.SetPublicURLBase(strings.TrimSuffix(r2.PublicURL(""), "/"))
	}

	hub := ws.NewHub()
	deliverer := deliver.New(st, hub, push.NewClient())
	gateway := ws.NewGateway(hub, st, deliverer, cfg.JWTSecret)
	server := api.NewServer(cfg, st, gateway, deliverer, r2)

	// Purge accounts whose 7-day deletion grace period has elapsed.
	reaperCtx, stopReaper := context.WithCancel(context.Background())
	defer stopReaper()
	go reaper.New(st, r2, time.Hour).Run(reaperCtx)

	addr := ":" + cfg.Port
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, server.Router()); err != nil {
		log.Fatalf("server: %v", err)
	}
}
