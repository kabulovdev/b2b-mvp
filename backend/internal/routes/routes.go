package routes

import (
	"b2b-mvp/backend/internal/handlers"
	"b2b-mvp/backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RouteDeps struct {
	DB        *gorm.DB
	JWTSecret string
}

func RegisterRoutes(router *gin.Engine, deps RouteDeps) {
	authHandler := handlers.AuthHandler{DB: deps.DB, JWTSecret: deps.JWTSecret}
	buyerHandler := handlers.BuyerHandler{DB: deps.DB}
	supplierHandler := handlers.SupplierHandler{DB: deps.DB}
	meHandler := handlers.MeHandler{}

	authMiddleware := middleware.AuthMiddleware{DB: deps.DB, JWTSecret: deps.JWTSecret}

	api := router.Group("/api")
	auth := api.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)

	api.GET("/me", authMiddleware.RequireAuth(), meHandler.GetMe)

	buyer := api.Group("/buyer")
	buyer.Use(authMiddleware.RequireAuth(), middleware.RequireRole("buyer"))
	buyer.POST("/rfqs", buyerHandler.CreateRFQ)
	buyer.GET("/rfqs", buyerHandler.ListRFQs)
	buyer.GET("/rfqs/:id/offers", buyerHandler.ListOffers)
	buyer.POST("/offers/:offerId/accept", buyerHandler.AcceptOffer)

	supplier := api.Group("/supplier")
	supplier.Use(authMiddleware.RequireAuth(), middleware.RequireRole("supplier"))
	supplier.POST("/products", supplierHandler.CreateProduct)
	supplier.GET("/products", supplierHandler.ListProducts)
	supplier.GET("/rfqs", supplierHandler.ListRFQs)
	supplier.POST("/offers", supplierHandler.CreateOffer)
}
