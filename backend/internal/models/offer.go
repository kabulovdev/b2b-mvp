package models

import "time"

type Offer struct {
	ID               uint      `gorm:"primaryKey"`
	RFQID            uint      `gorm:"not null"`
	RFQ              RFQ       `gorm:"foreignKey:RFQID"`
	SupplierID       uint      `gorm:"not null"`
	Supplier         User      `gorm:"foreignKey:SupplierID"`
	ProductID        uint      `gorm:"not null"`
	Product          Product   `gorm:"foreignKey:ProductID"`
	Price            float64   `gorm:"not null"`
	DeliveryTimeDays int       `gorm:"not null"`
	Status           string    `gorm:"not null"`
	CreatedAt        time.Time `gorm:"autoCreateTime"`
}
