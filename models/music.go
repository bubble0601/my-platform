package models

import "github.com/jinzhu/gorm"

// Song is model of song info
type Song struct {
	gorm.Model
	Title string
}
