package main

import (
    "log"
    "net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
    // load index.html from static/
    http.ServeFile(w, r, "./static/index.html")
}

func main() {
	fs := http.FileServer(http.Dir("./static"))
    http.HandleFunc("/", index)
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Print("Listening on :3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
