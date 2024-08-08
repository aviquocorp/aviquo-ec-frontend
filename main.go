package main

import (
    "log"
    "fmt"
    "bytes"
    "io/ioutil"
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

    // read the form data from the request
    err := r.ParseForm()
    if err != nil {
        log.Fatal(err)
    }

    // iterate over values
    htmlToInsert := ""

    for k, v := range r.Form {
        if k == "subjects" {
            for i := 0; i < len(v); i++ {
                htmlToInsert += fmt.Sprintf("<input type='hidden' name='subjects' value='%s'>", v[i])
            }
            break;
        } 
    }

    if htmlToInsert == "" {
        // redirect back to summerSubjects.html
        http.Redirect(w, r, "/static/summerSubjects.html", http.StatusFound)
        return
    }

    // read the file manually first
    content, err := ioutil.ReadFile("./static/grades-summer-programs.html")
    if err != nil {
        log.Fatal(err)
    }

    // replace the first instance of '{}' with "hi"
    content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 1)
    fmt.Fprintf(w, string(content))

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

    http.HandleFunc("/", index)
    http.HandleFunc("/static/grades-summer-programs.html", summerProgGrade)

    // fallback to static/
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Print("Listening on :3000...")
	err = http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
