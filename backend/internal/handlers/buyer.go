package handlers

import (
	"net/http"
	"time"

	"b2b-mvp/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BuyerHandler struct {
	DB *gorm.DB
}

type createRFQRequest struct {
	Category string  `json:"category"`
	Quantity float64 `json:"quantity"`
	Location string  `json:"location"`
}

func (h BuyerHandler) CreateRFQ(c *gin.Context) {
	var req createRFQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Category == "" || req.Quantity <= 0 || req.Location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing or invalid fields"})
		return
	}

	user := c.MustGet("user").(models.User)
	rfq := models.RFQ{
		BuyerID:   user.ID,
		Category:  req.Category,
		Quantity:  req.Quantity,
		Location:  req.Location,
		Status:    "open",
		CreatedAt: time.Now(),
	}

	if err := h.DB.Create(&rfq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create rfq"})
		return
	}

	c.JSON(http.StatusCreated, rfq)
}

func (h BuyerHandler) ListRFQs(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	var rfqs []models.RFQ
	if err := h.DB.Where("buyer_id = ?", user.ID).Order("created_at desc").Find(&rfqs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rfqs"})
		return
	}

	c.JSON(http.StatusOK, rfqs)
}

func (h BuyerHandler) ListOffers(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	rfqID := c.Param("id")

	var rfq models.RFQ
	if err := h.DB.Where("id = ? AND buyer_id = ?", rfqID, user.ID).First(&rfq).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rfq not found"})
		return
	}

	var offers []models.Offer
	if err := h.DB.Preload("Supplier").Preload("Product").Where("rfq_id = ?", rfq.ID).Order("created_at desc").Find(&offers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch offers"})
		return
	}

	c.JSON(http.StatusOK, offers)
}

func (h BuyerHandler) AcceptOffer(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	offerID := c.Param("offerId")

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var offer models.Offer
		if err := tx.Preload("RFQ").Where("id = ?", offerID).First(&offer).Error; err != nil {
			return err
		}

		if offer.RFQ.BuyerID != user.ID {
			return gorm.ErrRecordNotFound
		}

		if offer.RFQ.Status == "selected" {
			return gorm.ErrInvalidData
		}

		if err := tx.Model(&models.RFQ{}).Where("id = ?", offer.RFQID).Updates(map[string]interface{}{
			"status":            "selected",
			"selected_offer_id": offer.ID,
		}).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.Offer{}).Where("rfq_id = ?", offer.RFQID).Updates(map[string]interface{}{
			"status": "rejected",
		}).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.Offer{}).Where("id = ?", offer.ID).Update("status", "accepted").Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "offer not found"})
			return
		}
		if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rfq already selected"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to accept offer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "accepted"})
}
