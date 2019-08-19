package routes

import (
	"fmt"
	"net/http"
	"time"

	"ibubble/models"
	"ibubble/util"

	"github.com/gin-gonic/gin"
)

func musicRoute(r *gin.RouterGroup) {
	r.GET("/all", getAll)
	r.POST("/upload", upload)
}

func musicStaticRoute(r *gin.RouterGroup) {
	r.GET("/:hash/:name", func(c *gin.Context) {
		hash := c.Param("hash")
		name := c.Param("name")
		path, err := models.GetPath(hash, name)
		if err != nil {
			c.String(http.StatusNotFound, "")
		}
		c.File(path)
	})
}

func upload(c *gin.Context) {
	conf := util.GetConf()
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
		return
	}

	files := form.File["file[]"]
	for _, file := range files {
		dst := fmt.Sprintf("%s/temp/%d_%s", conf.Storage.Music, time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, dst)
		models.NewSong(dst, file.Filename, false)
	}
}

func getAll(c *gin.Context) {
	songs := models.GetSongs()
	ret := make([]map[string]interface{}, len(songs))

	for i, song := range songs {
		album := song.GetAlbum()
		ret[i] = gin.H{
			"id":       song.ID,
			"title":    song.Title,
			"artist":   song.Artist,
			"album":    album.Title,
			"time":     song.Length,
			"hash":     song.Hash,
			"filename": util.EscapeFilename(song.Title) + ".mp3",
			"year":     album.Year,
		}
	}
	c.JSON(http.StatusOK, ret)
}
