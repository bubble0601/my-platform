package util

import (
	"io"
	"log"
	"os"
)

var (
	logger log.Logger
	dev    = true
	sep    = " "
)

func printLog(prefix string, v ...interface{}) {
	log.SetPrefix(prefix + " ")
	values := insertSep(v)
	log.Print(values...)
	log.SetPrefix("")
}

func printLogf(prefix string, format string, v ...interface{}) {
	log.SetPrefix(prefix + " ")
	values := insertSep(v)
	log.Printf(format, values...)
	log.SetPrefix("")
}

func insertSep(values []interface{}) []interface{} {
	newValues := make([]interface{}, len(values)*2-1)
	for i, v := range values {
		newValues[i*2] = v
		if i < len(values)-1 {
			newValues[i*2+1] = sep
		}
	}
	return newValues
}

// LogDebug prints debug log
func LogDebug(v ...interface{}) {
	if dev {
		printLog("[debug]", v...)
	}
}

// LogDebugf prints debug log
func LogDebugf(format string, v ...interface{}) {
	if dev {
		printLogf("[debug]", format, v...)
	}
}

// LogInfo prints info log
func LogInfo(v ...interface{}) {
	printLog("[info]", v...)
}

// LogInfof prints info log
func LogInfof(format string, v ...interface{}) {
	printLogf("[info]", format, v...)
}

// LogFatal prints fatal log and exit
func LogFatal(v ...interface{}) {
	printLog("[fatal]", v...)
	os.Exit(1)
}

// LogFatalf prints fatal log and exit
func LogFatalf(format string, v ...interface{}) {
	printLogf("[fatal]", format, v...)
	os.Exit(1)
}

// SetLogOutput is setter of log output
func SetLogOutput(w io.Writer) {
	log.SetOutput(w)
}

// SetLogMode sets development mode if mode is true, otherwise production mode
func SetLogMode(mode bool) {
	dev = mode
}
