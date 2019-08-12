package models

import (
	"testing"
)

func TestScanAll(t *testing.T) {
	err := ScanAll("./storage/temp")
	if err != nil {
		t.Fatal(err)
	}
}

func TestNewSong(t *testing.T) {
	err := NewSong("./storage/temp/09 Another Chance.mp3", "09 Another Chance.mp3", false)
	if err != nil {
		t.Fatal(err)
	}
}
