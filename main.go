package main

import (
    "log"
    "fmt"
    "net/http"
    "database/sql"

    _ "github.com/mattn/go-sqlite3"
)

func index(w http.ResponseWriter, r *http.Request) {
    // load index.html from static/
    http.ServeFile(w, r, "./static/index.html")
}

func summerProgGrade(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/html; charset=utf-8")

    fmt.Fprintf(w, "<b>Hello, World!</b><br/>")
}

func main() {
    db, err := sql.Open("sqlite3", "./main.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // create table
    _, err = db.Exec(
        `CREATE TABLE IF NOT EXISTS summerProgs (
            name TEXT PRIMARY KEY,
            startGrade INTEGER,
            endGrade INTEGER,
            deadline DATE,
            link TEXT,
            cost INTEGER,
            scholarship TEXT,
            notes TEXT,
            category TEXT
        );`,
    )
    if err != nil {
        log.Fatal(err)
    }

	fs := http.FileServer(http.Dir("./static"))
    http.HandleFunc("/", index)
    http.HandleFunc("/summer-prog-grades", summerProgGrade)
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Print("Listening on :3000...")
	err = http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
