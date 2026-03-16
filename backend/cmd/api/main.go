package main

import (
	"log"

	"b2b-mvp/backend/internal/config"
	"b2b-mvp/backend/internal/db"
	"b2b-mvp/backend/internal/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	database := db.Connect(cfg.DatabaseURL)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.RegisterRoutes(router, routes.RouteDeps{DB: database, JWTSecret: cfg.JWTSecret})

	log.Printf("API running on :%s", cfg.Port)
	if err := router.Run("0.0.0.0:" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
