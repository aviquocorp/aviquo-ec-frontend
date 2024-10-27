package main

import (
	"database/sql"
	"fmt"
	"net/http"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func index(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/

	//http.ServeFile(w, r, "./static/landing/index.html")
    // redirect to "/ec"
    http.Redirect(w, r, "/ec", http.StatusFound)
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./main.db")
	if err != nil {
		log.Fatal(err)
	}


	initializeEc(db)
    initializeSat(db)

	// fallback to static/
	fs := http.FileServer(http.Dir("./static"))
    // load index.html from static/
    http.HandleFunc("/", index) 
	http.Handle("/static/", http.StripPrefix("/static/", fs))
    
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
	defer db.Close()
}
