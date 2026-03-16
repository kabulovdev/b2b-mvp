package handlers

import (
	"net/http"

	"b2b-mvp/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type MeHandler struct{}

func (h MeHandler) GetMe(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	c.JSON(http.StatusOK, user)
}
