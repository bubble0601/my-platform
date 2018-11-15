package models

import (
	"fmt"
	"time"

	"ibubble/util"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // mysql driver for gorm
)

var db *gorm.DB

func init() {
	conf := util.GetConf()
	ms := conf.MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", ms.User, ms.Password, ms.Host, ms.DBName)

	var err error
	db, err = gorm.Open("mysql", dsn)
	if err != nil {
		util.LogFatal("failed to connect mysql server: ", err)
	}
	defer db.Close()

	db.DB().SetMaxIdleConns(15)
	db.DB().SetMaxOpenConns(30)
	db.DB().SetConnMaxLifetime(time.Hour)
	initDB(db)
}

func initDB(db *gorm.DB) {
	db.AutoMigrate(&Song{})
}

// DB returns gorm.DB object
func DB() *gorm.DB {
	return db
}
