package main

import (
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs) // перенаправлялка на путь "/"

	// Обработка /chats → отправляем chat.html
	http.HandleFunc("/chat", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/chat.html")
	})

	println("Сервер запущен на http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
