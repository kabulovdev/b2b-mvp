package handlers

import (
	"net/http"

	"b2b-mvp/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SupplierHandler struct {
	DB *gorm.DB
}

type createProductRequest struct {
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Price    float64 `json:"price"`
	Unit     string  `json:"unit"`
	Stock    int     `json:"stock"`
}

type createOfferRequest struct {
	RFQID            uint    `json:"rfq_id"`
	ProductID        uint    `json:"product_id"`
	Price            float64 `json:"price"`
	DeliveryTimeDays int     `json:"delivery_time_days"`
}

func (h SupplierHandler) CreateProduct(c *gin.Context) {
	var req createProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Name == "" || req.Category == "" || req.Price <= 0 || req.Unit == "" || req.Stock < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing or invalid fields"})
		return
	}

	user := c.MustGet("user").(models.User)
	product := models.Product{
		SupplierID: user.ID,
		Name:       req.Name,
		Category:   req.Category,
		Price:      req.Price,
		Unit:       req.Unit,
		Stock:      req.Stock,
	}

	if err := h.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (h SupplierHandler) ListProducts(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	var products []models.Product
	if err := h.DB.Where("supplier_id = ?", user.ID).Order("created_at desc").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (h SupplierHandler) ListRFQs(c *gin.Context) {
	user := c.MustGet("user").(models.User)

	var categories []string
	if err := h.DB.Model(&models.Product{}).Where("supplier_id = ?", user.ID).Distinct().Pluck("category", &categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch categories"})
		return
	}

	if len(categories) == 0 {
		c.JSON(http.StatusOK, []models.RFQ{})
		return
	}

	var rfqs []models.RFQ
	if err := h.DB.Where("status = ? AND category IN ?", "open", categories).Order("created_at desc").Find(&rfqs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rfqs"})
		return
	}

	c.JSON(http.StatusOK, rfqs)
}

func (h SupplierHandler) CreateOffer(c *gin.Context) {
	var req createOfferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.RFQID == 0 || req.ProductID == 0 || req.Price <= 0 || req.DeliveryTimeDays <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing or invalid fields"})
		return
	}

	user := c.MustGet("user").(models.User)

	var rfq models.RFQ
	if err := h.DB.First(&rfq, req.RFQID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rfq not found"})
		return
	}

	if rfq.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rfq not open"})
		return
	}

	var product models.Product
	if err := h.DB.Where("id = ? AND supplier_id = ?", req.ProductID, user.ID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	if product.Category != rfq.Category {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product category mismatch"})
		return
	}

	offer := models.Offer{
		RFQID:            rfq.ID,
		SupplierID:       user.ID,
		ProductID:        product.ID,
		Price:            req.Price,
		DeliveryTimeDays: req.DeliveryTimeDays,
		Status:           "pending",
	}

	if err := h.DB.Create(&offer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create offer"})
		return
	}

	c.JSON(http.StatusCreated, offer)
}
