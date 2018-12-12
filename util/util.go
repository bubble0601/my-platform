package util

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

// GetFiles returns file list of specified directory
func GetFiles(dir string) []string {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		LogInfo("failed to load static files")
	}

	var ret []string
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		ret = append(ret, file.Name())
	}
	return ret
}

// FileExists returns true if the file specified by filename exists
func FileExists(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil
}

// RenameIfExists renames specified file not to overwrite
// Example: log/foo.log => log/foo.1.log
func RenameIfExists(filename string) {
	if !FileExists(filename) {
		return
	}
	s := strings.Split(filename, ".")
	var format string
	name := strings.Join(s[:len(s)-1], ".")
	format = strings.Join([]string{name, "%d", s[len(s)-1]}, ".")
	for i := 0; ; i++ {
		newname := fmt.Sprintf(format, i)
		if !FileExists(newname) {
			os.Rename(filename, newname)
			break
		}
	}
}

// Contains returns true if slice contains e
func Contains(slice []interface{}, e interface{}) bool {
	for _, v := range slice {
		if e == v {
			return true
		}
	}
	return false
}

// Assert panics if expression is false
func Assert(expression bool) {
	if !expression {
		panic("assertion failed")
	}
}
