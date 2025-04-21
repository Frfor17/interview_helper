package main

import (
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	println("Сервер запущен на http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
