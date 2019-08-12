package routes

import (
	"net/http"

	"ibubble/util"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers routers to gin Engine
func RegisterRoutes(server *gin.Engine) {
	api := server.Group("/api")
	{
		userRoute(api.Group("/user"))
		musicRoute(api.Group("/music", authRequired()))
	}

	static := server.Group("/static")
	{
		musicStaticRoute(static.Group("/music", authRequired()))
	}

	server.NoRoute(func(c *gin.Context) {
		// in production, static files are served by nginx directly instead of this
		if util.FileExists("./static" + c.Request.RequestURI) {
			c.File("./static" + c.Request.RequestURI)
			return
		}
		if c.GetString("group") == "api" {
			c.JSON(http.StatusNotFound, gin.H{"error_message": "Not found"})
		} else {
			c.HTML(http.StatusOK, "index.html", gin.H{
				"version": c.GetInt("version"),
			})
		}
	})
}

func errMsg(msg string) map[string]interface{} {
	return gin.H{
		"error_message": msg,
	}
}
