package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string

	R2Endpoint  string
	R2Bucket    string
	R2AccessKey string
	R2SecretKey string
	R2AccountID string
	R2PublicURL string
}

func Load() (*Config, error) {
	c := &Config{
		Port:        getenv("PORT", "7002"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisURL:    os.Getenv("REDIS"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		R2Endpoint:  os.Getenv("R2_ENDPOINT"),
		R2Bucket:    os.Getenv("R2_BUCKET_NAME"),
		R2AccessKey: os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2AccountID: os.Getenv("R2_ACCOUNT_ID"),
		R2PublicURL: os.Getenv("R2_PUBLIC_URL"),
	}
	if c.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	return c, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
