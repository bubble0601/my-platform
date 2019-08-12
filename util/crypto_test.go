package util

import (
	"fmt"
	"testing"
)

func TestHash(t *testing.T) {
	fmt.Print(Hash([]byte{10, 20, 30, 15, 13, 18, 100, 200}))
}
