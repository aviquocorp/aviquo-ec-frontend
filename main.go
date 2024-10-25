package main

import (
	"database/sql"
	"fmt"
	"net/http"
)

var db *sql.DB

func main() {
	initializeEc()
	http.HandleFunc("/sat", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
	http.HandleFunc("/sat/view-details", ViewQuestionDetailsHandler)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
