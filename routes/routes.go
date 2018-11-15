package routes

import (
	"ibubble/util"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers routers to gin Engine
func RegisterRoutes(server *gin.Engine) {
	api := server.Group("/api")
	{
		api.GET("/data", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"data": gin.H{
					"key": "value",
				},
			})
		})
		api.GET("/ss", func(c *gin.Context) {
			session := sessions.Default(c)
			var count int
			v := session.Get("count")
			if v == nil {
				count = 0
			} else {
				count = v.(int)
				count++
			}
			session.Set("count", count)
			session.Save()
			c.JSON(200, gin.H{"count": count})
		})
	}

	server.NoRoute(func(c *gin.Context) {
		// in production, static files are served by nginx directry instead of this
		if util.FileExists("./static" + c.Request.RequestURI) {
			c.File("./static" + c.Request.RequestURI)
			return
		}
		if c.GetString("group") == "api" {
			c.JSON(http.StatusNotFound, gin.H{"error_message": "not found"})
		} else {
			c.HTML(http.StatusOK, "index.html", gin.H{
				"version": c.GetInt("version"),
			})
		}
	})
}
