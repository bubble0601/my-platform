package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	csrf "github.com/utrack/gin-csrf"

	"ibubble/models"
	"ibubble/routes"
	"ibubble/util"
)

var server *gin.Engine

func main() {
	server = gin.New()
	initLogger()
	initServer()
	run()
}

func initLogger() {
	if gin.IsDebugging() {
		models.DB().LogMode(true)
		return
	}
	util.SetLogMode(false)
	conf := util.GetConf()
	logfile := conf.Log.Output
	errorLogfile := conf.Log.Error
	util.RenameIfExists(logfile)
	util.RenameIfExists(errorLogfile)
	f, err := os.Create(logfile)
	if err != nil {
		util.LogInfof("failed to open %s", logfile)
	} else {
		gin.DefaultWriter = io.MultiWriter(f)
		util.SetLogOutput(f)
	}
	fe, err := os.Create(errorLogfile)
	if err != nil {
		util.LogInfof("failed to open %s", errorLogfile)
	} else {
		gin.DefaultErrorWriter = io.MultiWriter(fe)
		// gorm outputs only error log by default
		models.DB().SetLogger(log.New(fe, "[gorm-error]", 0))
	}
	gin.DisableConsoleColor()
}

func initServer() {
	conf := util.GetConf()

	server.Use(func(c *gin.Context) {
		// set values
		c.Set("group", strings.Split(c.Request.URL.Path, "/")[1])

		c.Next()

		// set body if response body is empty(for recovery)
		if c.Writer.Status() == http.StatusInternalServerError && c.Writer.Size() == 0 {
			msg := "Internal Server Error"
			if gin.IsDebugging() {
				msg += strings.Join(c.Errors.Errors(), "\n")
			}
			util.LogInfo(msg)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error_message": msg,
			})
		}
	})

	server.Use(gin.Logger())
	server.Use(gin.Recovery())

	// session
	store := cookie.NewStore([]byte(conf.Session.Secret))
	store.Options(sessions.Options{
		Path:     "/",
		Secure:   conf.Server.SSL,
		HttpOnly: true,
		MaxAge:   2592000,
	})
	server.Use(sessions.Sessions(conf.Session.Name, store))

	// csrf token
	server.Use(csrf.Middleware(csrf.Options{
		Secret: conf.Session.CsrfSecret,
		ErrorFunc: func(c *gin.Context) {
			util.Assert(c.GetString("group") == "api")
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error_message": "Invalid CSRF Token",
			})
		},
	}))

	// load template
	server.LoadHTMLFiles("static/index.html")

	routes.RegisterRoutes(server)
}

func run() {
	var err error
	if gin.IsDebugging() {
		err = server.Run()
	} else {
		err = server.RunUnix("deploy/tmp/gin.sock")
	}
	if err != nil {
		util.LogFatal("failed to run server: ", err)
	}
}
