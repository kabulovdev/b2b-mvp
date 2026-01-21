package models

import "time"

type RFQ struct {
	ID              uint    `gorm:"primaryKey"`
	BuyerID         uint    `gorm:"not null"`
	Buyer           User    `gorm:"foreignKey:BuyerID"`
	Category        string  `gorm:"not null"`
	Quantity        float64 `gorm:"not null"`
	Location        string  `gorm:"not null"`
	Status          string  `gorm:"not null"`
	SelectedOfferID *uint
	CreatedAt       time.Time `gorm:"autoCreateTime"`
}
