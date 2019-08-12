package util

import (
	"encoding/binary"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

const (
	fnvOffset uint32 = 2166136261
	fnvPrime  uint32 = 16777619
)

// Hash converts bytes to hash by FNV-1
func Hash(bytes []byte) string {
	hash := fnvOffset
	for _, b := range bytes {
		hash = (fnvPrime * hash) ^ uint32(b)
	}
	hashb := make([]byte, 4)
	binary.LittleEndian.PutUint32(hashb, hash)
	return hex.EncodeToString(hashb)
}

// PasswordHash converts raw password to hash
func PasswordHash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

// VerifyPassword verifies password comparing with hash
func VerifyPassword(hash string, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
