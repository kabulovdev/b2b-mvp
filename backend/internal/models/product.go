package models

import "time"

type Product struct {
	ID         uint      `gorm:"primaryKey"`
	SupplierID uint      `gorm:"not null"`
	Supplier   User      `gorm:"foreignKey:SupplierID"`
	Name       string    `gorm:"not null"`
	Category   string    `gorm:"not null"`
	Price      float64   `gorm:"not null"`
	Unit       string    `gorm:"not null"`
	Stock      int       `gorm:"not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}
