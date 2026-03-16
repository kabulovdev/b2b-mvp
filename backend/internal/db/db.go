package db

import (
	"log"

	"b2b-mvp/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(databaseURL string) *gorm.DB {
	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	if err := database.AutoMigrate(&models.User{}, &models.Product{}, &models.RFQ{}, &models.Offer{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	return database
}
