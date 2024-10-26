package main

import (
	"database/sql"
	"fmt"
	"net/http"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./main.db")
	if err != nil {
		log.Fatal(err)
	}


	initializeEc(db)
	http.HandleFunc("/sat", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
	defer db.Close()
}
