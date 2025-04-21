package main

import (
	"html/template"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	data := struct {
		Name string
	}{
		Name: "world",
	}

	tmpl.Execute(w, data)
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}
