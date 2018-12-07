package routes

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	csrf "github.com/utrack/gin-csrf"

	"ibubble/models"
	"ibubble/util"
)

func userRoute(r *gin.RouterGroup) {
	r.GET("/init", initUser)
	r.POST("/signin", signIn)
	r.GET("/signout", signOut)
}

func initUser(c *gin.Context) {
	session := sessions.Default(c)
	uid, ok := session.Get("UserID").(uint)
	session.Clear()

	if !ok {
		c.JSON(http.StatusOK, gin.H{
			"token": csrf.GetToken(c),
		})
		return
	}

	var user models.User
	if err := user.FetchByID(int(uid)); err != nil {
		session.Save()
		c.JSON(http.StatusOK, gin.H{
			"token": csrf.GetToken(c),
		})
		return
	}

	session.Set("UserID", uid)
	session.Save()
	c.JSON(http.StatusOK, gin.H{
		"token": csrf.GetToken(c),
		"user": gin.H{
			"name": user.Name,
		},
	})
}

func signIn(c *gin.Context) {
	var json struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
		return
	}

	var user models.User
	if err := user.FetchByName(json.Username); err != nil {
		c.JSON(http.StatusUnauthorized, errMsg("Sign in failed"))
		return
	}

	if err := util.VerifyPassword(user.Password, json.Password); err != nil {
		c.JSON(http.StatusUnauthorized, errMsg("Sign in failed"))
		return
	}

	session := sessions.Default(c)
	session.Set("UserID", user.ID)
	session.Save()
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"name": user.Name,
		},
	})
}

func signOut(c *gin.Context) {
	session := sessions.Default(c)
	session.Delete("UserID")
	session.Save()
}
