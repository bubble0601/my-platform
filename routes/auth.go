package routes

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"

	"ibubble/models"
	"ibubble/util"
)

// MiddleWare
func authRequired() func(*gin.Context) {
	return func(c *gin.Context) {
		util.Assert(util.Contains([]string{"api", "static"}, c.GetString("group")))
		session := sessions.Default(c)
		userID, ok := session.Get("UserID").(uint)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, errMsg("Sign in required"))
			return
		}

		var user models.User
		if !user.Exists(int(userID)) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, errMsg("Sign in required"))
			session.Clear()
			session.Save()
			return
		}
		c.Next()
	}
}
