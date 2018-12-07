package models

import (
	"github.com/jinzhu/gorm"
)

// User is model of users
type User struct {
	gorm.Model
	Name     string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
}

// Exists returns whether the user specified by id exists
func (u *User) Exists(id int) bool {
	return !db.Select("id").First(u, id).RecordNotFound()
}

// FetchByID fetches user by id, returns error if not exists
func (u *User) FetchByID(id int) error {
	return db.First(u, id).Error
}

// FetchByName fetches user by id, returns error if not exists
func (u *User) FetchByName(name string) error {
	err := db.Take(u, "name = ?", name).Error
	return err
}
