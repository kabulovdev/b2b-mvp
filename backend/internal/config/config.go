package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	CORSOrigin  string
}

func Load() Config {
	port := getEnv("PORT", "8080")
	jwtSecret := getEnv("JWT_SECRET", "changeme")
	corsOrigin := getEnv("CORS_ORIGIN", "http://localhost:5173")

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		host := getEnv("DB_HOST", "localhost")
		dbPort := getEnv("DB_PORT", "5432")
		name := getEnv("DB_NAME", "b2b_mvp")
		user := getEnv("DB_USER", "b2b")
		password := getEnv("DB_PASSWORD", "b2bpassword")
		dbURL = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, password, name, dbPort)
	}

	return Config{
		Port:        port,
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		CORSOrigin:  corsOrigin,
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
