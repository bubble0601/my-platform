package util

import (
	"io/ioutil"

	yaml "gopkg.in/yaml.v2"
)

var conf Conf

// Conf stores application settings
type Conf struct {
	Server struct {
		SSL bool
	}
	Log struct {
		Output string
		Error  string
	}
	MySQL struct {
		User     string
		Password string
		Host     string
		DBName   string
	}
	Session struct {
		Name       string
		Secret     string
		CsrfSecret string
	}
}

func init() {
	body, err := ioutil.ReadFile("conf.yml")
	if err != nil {
		LogFatal("failed to load conf: ", err)
	}

	err = yaml.Unmarshal(body, &conf)
	if err != nil {
		LogFatal("failed to load conf: ", err)
	}
}

// GetConf returns config
func GetConf() *Conf {
	return &conf
}
