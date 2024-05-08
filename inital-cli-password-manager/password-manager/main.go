package main

import (
	"crypto/sha256"
	"flag"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/tyler-smith/go-bip39"
)

const (
	iterations = 10000 // Number of iterations for hashing
)

func main() {
	// Define flags
	generatePassword := flag.Bool("generate", false, "generate a password")
	createPassphrase := flag.Bool("create-passphrase", false, "create a random passphrase")
	flag.Parse()

	// Execute based on flags
	if *generatePassword {
		genPassword()
	} else if *createPassphrase {
		genPassphrase()
	} else {
		fmt.Println("Please specify a valid flag: -generate or -create-passphrase")
	}
}

func genPassword() {
	// Get passphrase and url from command line arguments
	if len(os.Args) < 4 {
		fmt.Println("Usage: main -generate <counter> <passphrase> <url>")
		os.Exit(1)
	}

	counter := os.Args[1]

	// Combine all arguments except the last one as passphrase
	passphrase := strings.Join(os.Args[2:len(os.Args)-1], " ")
	url := os.Args[len(os.Args)-1]

	url = cleanURL(url)
	fmt.Println("Cleaned URL:", url)

	// Hash the combination of passphrase and url
	hashed := hash(counter, passphrase, url)

	// Transform the bytes into desired characters
	password := transformBytes(hashed)

	// Print the password
	fmt.Println("Generated Password:", password)
}

func genPassphrase() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: main -create-passphrase")
		os.Exit(1)
	}

	// API used to generate random passphrase of 12 words to increase entropy
	entropy, _ := bip39.NewEntropy(128)
	passphrase, _ := bip39.NewMnemonic(entropy)

	fmt.Println(passphrase)
}

func hash(counter, passphrase, url string) []byte {
	data := []byte(counter + passphrase + url)
	hash := sha256.New()
	for i := 0; i < iterations; i++ {
		hash.Write(data)
		data = hash.Sum(nil)
		hash.Reset()
	}
	return data
}

func transformBytes(data []byte) string {

	// Define characters allowed in the password
	allowedChars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&?"

	// Initialize a new string builder
	var passwordBuilder []byte

	// Iterate over each byte in the data
	for _, b := range data {
		// Convert byte into index in allowedChars
		index := int(b) % len(allowedChars)
		// Append corresponding character to passwordBuilder
		passwordBuilder = append(passwordBuilder, allowedChars[index])
	}

	// Convert byte slice to string
	password := string(passwordBuilder)
	return password
}

func cleanURL(URL string) string {

	if !strings.Contains(URL, "://") {
		URL = "http://" + URL
	}

	// Remove protocol and www
	parsed, err := url.Parse(URL)

	if err != nil {
		fmt.Println("Error parsing URL:", err)
		os.Exit(1)
	}

	URL = parsed.Hostname()

	// if URL has two periods, remove everything up to and including the first one
	if strings.Count(URL, ".") > 1 {
		URL = URL[strings.Index(URL, ".")+1:]
	}

	return URL
}
