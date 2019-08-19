package routes

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/jinzhu/gorm"

	"ibubble/models"
	"ibubble/util"

	"github.com/gin-gonic/gin"
)

func musicRoute(r *gin.RouterGroup) {
	r.GET("/all", getAll)
	r.GET("/getsong", getSong)
	r.POST("/updaterate", updateRate)
	r.POST("/upload", upload)
}

func musicStaticRoute(r *gin.RouterGroup) {
	r.GET("/:hash/:name", func(c *gin.Context) {
		hash := c.Param("hash")
		name := c.Param("name")
		path, err := models.GetPath(hash, name)
		if err != nil {
			c.String(http.StatusNotFound, "Requested reesource not found")
		}
		c.File(path)
	})
}

func songToJSON(song models.Song) gin.H {
	album, _ := song.GetAlbum()
	return gin.H{
		"id":       song.ID,
		"title":    song.Title,
		"artist":   song.Artist,
		"album":    album.Title,
		"time":     song.Length,
		"hash":     song.Hash,
		"filename": util.EscapeFilename(song.Title) + ".mp3",
		"year":     album.Year,
		"rate":     song.Rate,
	}
}

func handleDBError(c *gin.Context, err error) {
	if gorm.IsRecordNotFoundError(err) {
		c.JSON(http.StatusNotFound, errMsg("Requested resource not found"))
		return
	}
	c.JSON(http.StatusInternalServerError, errMsg(err.Error()))
}

func getAll(c *gin.Context) {
	songs := models.GetSongs()
	ret := make([]map[string]interface{}, len(songs))

	for i, song := range songs {
		ret[i] = songToJSON(song)
	}
	c.JSON(http.StatusOK, ret)
}

func getSong(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
		return
	}
	var song models.Song
	if err = song.FetchByID(id); err != nil {
		handleDBError(c, err)
		return
	}

	c.JSON(http.StatusOK, songToJSON(song))
}

func updateRate(c *gin.Context) {
	var json struct {
		ID   int `json:"id"`
		Rate int `json:"rate"`
	}
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, errMsg("Invalid request"))
		return
	}

	var song models.Song
	fmt.Println("ur1")
	if err := song.FetchByID(json.ID); err != nil {
		handleDBError(c, err)
		fmt.Printf("%s\n", err.Error())
		return
	}
	fmt.Println("ur2")
	if err := song.Update(models.Song{Rate: json.Rate}); err != nil {
		handleDBError(c, err)
		return
	}
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
