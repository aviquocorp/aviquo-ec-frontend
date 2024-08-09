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

var db *sql.DB

/* https://dev.to/chigbeef_77/bool-int-but-stupid-in-go-3jb3 */
func fastBoolConv(b bool) int {
    return int(*(*byte)(unsafe.Pointer(&b)))
}

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

    v := r.Form["subjects"]
    for i := 0; i < len(v); i++ {
        htmlToInsert += fmt.Sprintf("<input type='hidden' name='subjects' value='%s'>", v[i])
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

func resultsSummerProg(w http.ResponseWriter, r *http.Request) {
    // read the form data from the request
    err := r.ParseForm()
    if err != nil {
        // redirect back to summerSubjects.html
        http.Redirect(w, r, "/static/summerSubjects.html", http.StatusFound)
        return
    }


    subjects := r.Form["subjects"]
    grades := r.Form["grade"]
    costs := r.Form["cost"]

    // check if subject is defined in form
    if subjects == nil || len(subjects) == 0 {
        // redirect back to summerSubjects.html
        http.Redirect(w, r, "/static/summerSubjects.html", http.StatusFound)
        return
    }

    // check if grade and cost is defined in form
    if grades == nil || len(grades) == 0 || costs == nil || len(costs) == 0 {
        http.Redirect(w, r, "/static/grades-summer-programs.html", http.StatusFound)
        return
    }

    /* dynamically construct the query */
    /*
    query := "SELECT * FROM summerProgs WHERE cost >= " + 
                (fastBoolConv(costs[0] == "paid")) + 
                strings.Repeat(" AND grade BETWEEN ? AND ? ", len(grades)) +
                */


    // query the database for the subject
    data , err := db.Query("SELECT * FROM summerProgs ") //WHERE cost >= ? AND startGrade <= ? AND endGrade >= ?", r.Form["cost"][0] == "paid", r.Form["grade"][0], r.Form["grade"][0])
    if err != nil {
        log.Fatal(err)
    }

    log.Print("data: %s", data)

    /*
    htmlToInsert := `
        <div class=\"program-cards2\">
          <div class=\"nyu-applied-research\">boa student leaders</div>
          <div class=\"program-cards-child1\"></div>
          <img
            class=\"lab-items-icon\"
            loading=\"lazy\"
            alt=\"\"
            src=\"./public/lab-items@2x.png\"
          />
        </div>
    `
    */

}

func main() {
    var err error
    db, err = sql.Open("sqlite3", "./main.db")
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
    http.HandleFunc("/static/results-page-summer-programs.html", resultsSummerProg)

    // fallback to static/
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Print("Listening on :3000...")
	err = http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
