package models

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"ibubble/util"

	"github.com/jinzhu/gorm"
	id3 "github.com/mikkyang/id3-go"
	v2 "github.com/mikkyang/id3-go/v2"
)

// Artist represents an artist
type Artist struct {
	gorm.Model
	Name   string `gorm:"not null"`
	Ruby   string
	Albums []Album
	Songs  []Song
}

// Album represents a music album
type Album struct {
	gorm.Model
	Title      string `gorm:"not null"`
	ArtistID   uint   `gorm:"not null"`
	Year       int    `gorm:"type:smallint unsigned"`
	TrackCount int    `gorm:"type:tinyint unsigned"`
	DiscCount  int    `gorm:"type:tinyint unsigned;default:1"`
	Songs      []Song
}

// Song represents a song
type Song struct {
	gorm.Model
	Filename   string `gorm:"not null"`
	Hash       string `gorm:"unique;not null"`
	Title      string `gorm:"not null"`
	Artist     string
	ArtistID   uint
	AlbumID    uint
	TrackNum   int  `gorm:"type:tinyint unsigned"`
	DiscNum    int  `gorm:"type:tinyint unsigned;default:1"`
	HasArtwork bool `gorm:"not null;default:false"`
	HasLyric   bool `gorm:"not null;default:false"`
	Length     int  `gorm:"type:smallint unsigned;not null"`
	Rate       int  `gorm:"type:tinyint unsigned"`
}

func init() {
	tables := []interface{}{&Artist{}, &Album{}, &Song{}}
	db.AutoMigrate(tables...)
	// db.DropTableIfExists(tables...)
	// db.CreateTable(tables...)
}

// GetSongs returns all songs
func GetSongs() []Song {
	var songs []Song
	db.Find(&songs)
	return songs
}

// ScanAll scans all mp3 files in the music directory
func ScanAll(dir string) error {
	scanErrors := make(map[string]error)

	files, err := getfiles(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		err := NewSong(file, path.Base(file), false)
		if err != nil {
			scanErrors[file] = err
		}
	}
	for file, err := range scanErrors {
		fmt.Println("error occurred when handling", file)
		fmt.Printf("\t%v\n", err)
	}
	if len(scanErrors) > 0 {
		return errors.New("scan error")
	}
	return nil
}

// NewSong create record of newly added song
func NewSong(filename, originalFileName string, allowOverwrite bool) error {
	conf := util.GetConf()

	if !util.FileExists(filename) {
		return errors.New("file not found")
	}

	artist, album, song, err := loadID3Tags(filename)
	if err != nil {
		return err
	}

	song.Hash = util.Hash([]byte(filename))
	song.Filename = genFilename(artist, album, song, originalFileName)

	// Move
	dst := conf.Storage.Music + "/" + song.Filename
	if !allowOverwrite && util.FileExists(dst) {
		return errors.New("already exists")
	}
	if filename != dst {
		// fmt.Println("a")
		if err = os.MkdirAll(path.Dir(dst), 0755); err != nil {
			return err
		}
		// fmt.Println(util.FileExists(filename))
		if err = os.Rename(filename, dst); err != nil {
			return err
		}
	}

	// Save to DB
	err = db.Where(&Artist{Name: artist.Name}).First(&artist).Error
	if err != nil {
		db.Create(&artist)
	}
	album.ArtistID = artist.ID
	song.ArtistID = artist.ID

	var _album Album
	err = db.Where(&Album{Title: album.Title, ArtistID: album.ArtistID}).First(&_album).Error
	if err != nil {
		db.Create(album)
	} else {
		changed := false
		if _album.Year == 0 && album.Year != 0 {
			_album.Year = album.Year
			changed = true
		}
		if _album.TrackCount == 0 && album.TrackCount != 0 {
			_album.TrackCount = album.TrackCount
			changed = true
		}
		if _album.DiscCount == 0 && album.DiscCount != 0 {
			_album.DiscCount = album.DiscCount
			changed = true
		}
		if changed {
			db.Save(&_album)
		}
	}
	if album.ID != 0 {
		song.AlbumID = album.ID
	} else {
		song.AlbumID = _album.ID
	}

	db.Create(&song)

	return nil
}

func loadID3Tags(filename string) (*Artist, *Album, *Song, error) {
	var artist Artist
	var album Album
	var song Song

	// 初期化. ID3v2.3への変換など. 演奏時間が出力される
	out, err := exec.Command("python", "./scripts/processMP3.py", "init", filename).Output()
	if err != nil {
		return nil, nil, nil, err
	}
	l, err := strconv.Atoi(string(out))
	if err != nil {
		return nil, nil, nil, err
	}
	song.Length = l

	// ID3タグ読み込み
	file, err := id3.Open(filename)

	if err != nil {
		return nil, nil, nil, err
	}
	defer file.Close()

	for _, f := range file.AllFrames() {
		switch f.Id() {
		case "TIT2": // Title
			song.Title = getID3String(&f)
		case "TPE1": // Artist
			song.Artist = getID3String(&f)
		case "TPE2": // Album artist
			artist.Name = getID3String(&f)
		case "TALB": // Album
			album.Title = getID3String(&f)
		case "TYER": // Year
			if y, err := strconv.Atoi(getID3String(&f)); err == nil {
				album.Year = y
			}
		case "TRCK": // Track number
			track := getID3String(&f)
			slice := strings.Split(track, "/")
			if len(slice) == 1 {
				n, err := strconv.Atoi(track)
				if err == nil {
					song.TrackNum = n
				}
			} else { // len(slice) > 1
				n, err := strconv.Atoi(slice[0])
				total, err2 := strconv.Atoi(slice[1])
				if err == nil && err2 == nil {
					song.TrackNum = n
					album.TrackCount = total
				}
			}
		case "TPOS": // Disc number
			track := getID3String(&f)
			slice := strings.Split(track, "/")
			if len(slice) == 1 {
				n, err := strconv.Atoi(track)
				if err == nil {
					song.DiscNum = n
				}
			} else { // len(slice) > 1
				n, err := strconv.Atoi(slice[0])
				total, err2 := strconv.Atoi(slice[1])
				if err == nil && err2 == nil {
					song.DiscNum = n
					album.DiscCount = total
				}
			}
		case "USLT": // Lyrics
			song.HasLyric = true
		case "APIC": // Artwork
			song.HasArtwork = true
		default:
			// nop
		}
	}
	return &artist, &album, &song, nil
}

func getfiles(dir string) ([]string, error) {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var paths []string
	for _, file := range files {
		if file.IsDir() {
			files, err := getfiles(filepath.Join(dir, file.Name()))
			if err != nil {
				return nil, err
			}
			paths = append(paths, files...)
			continue
		}
		paths = append(paths, filepath.Join(dir, file.Name()))
	}

	return paths, nil
}

func genFilename(artist *Artist, album *Album, song *Song, originalName string) string {
	// Set filename
	artistName := escapeFilename(artist.Name)
	albumTitle := escapeFilename(album.Title)
	songTitle := escapeFilename(song.Title)
	if artist.Name != "" {
		if album.Title != "" {
			if song.Title != "" {
				return fmt.Sprintf("%s/%s/%02d %s.mp3", artistName, albumTitle, song.TrackNum, songTitle)
			}
			return fmt.Sprintf("%s/%s/%s", artistName, albumTitle, originalName)
		}
		if song.Title != "" {
			return fmt.Sprintf("%s/Unknown Album/%02d %s.mp3", artistName, song.TrackNum, songTitle)
		}
		return fmt.Sprintf("%s/Unknown Album/%s", artistName, originalName)
	}
	if song.Title != "" {
		return fmt.Sprintf("Unknown Artist/%s.mp3", songTitle)
	}
	return fmt.Sprintf("Unknown Artist/%s", originalName)
}

func escapeFilename(name string) string {
	// 環境によってファイル名に使えない文字を取り除く
	for _, c := range []string{"\\", "/", "|", ":", "*", "?", "\"", "<", ">"} {
		name = strings.Replace(name, c, " ", -1)
	}
	return name
}

func getID3String(f *v2.Framer) string {
	return strings.TrimRight((*f).String(), string(byte(0)))
}

// GetPath returns path to requested file
func GetPath(hash, name string) (string, error) {
	var song Song
	var path string
	err := db.Where("hash = ?", hash).First(&song).Error
	if err != nil {
		return path, err
	}
	if name != escapeFilename(song.Title) {
		return path, errors.New("Not found")
	}

	var artist Artist
	var album Album
	db.Model(&song).Related(&artist)
	db.Model(&song).Related(&album)
	path = fmt.Sprintf("%s/%s", util.GetConf().Storage.Music, genFilename(&artist, &album, &song, name))
	return path, nil
}
