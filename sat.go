package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func findQuestions(w http.ResponseWriter, r *http.Request, test, category, domain, skill, difficulty string) {
	// Open the SQLite database file
	db, err := sql.Open("sqlite3", "./satData.db")
	if err != nil {
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Build the query with filters
	query := `
        SELECT questionId 
        FROM sat_questions 
        WHERE test = ? 
        AND category = ? 
        AND domain = ? 
        AND skill = ? 
        AND difficulty = ?`

	// Execute the query with user inputs as filters
	rows, err := db.Query(query, test, category, domain, skill, difficulty)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Start HTML response
	fmt.Fprintln(w, `<html><body>`)
	fmt.Fprintln(w, `<h1>Matching Question IDs:</h1>`)

	// Display matching question IDs in an unordered list
	fmt.Fprintln(w, `<ul>`)
	var questionId string
	matchingQuestions := []string{}
	for rows.Next() {
		err := rows.Scan(&questionId)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Fprintf(w, `<li>%s</li>`, questionId)
		matchingQuestions = append(matchingQuestions, questionId)
	}
	fmt.Fprintln(w, `</ul>`)

	// If there are matching questions, ask for a questionId to display details and answer
	if len(matchingQuestions) > 0 {
		fmt.Fprintln(w, `
		<form action="/sat/view-details" method="post">
			<label for="questionId">Enter the question ID to view details and answer:</label><br>
			<input type="text" id="questionId" name="questionId"><br>
			<input type="submit" value="Submit">
		</form>
		`)
	} else {
		fmt.Fprintln(w, "No questions found matching the filters.")
	}

	// End HTML response
	fmt.Fprintln(w, `</body></html>`)
}

// viewQuestionDetails handles displaying all information for a specific questionId
// and showing the answer and rationale
func viewQuestionDetails(w http.ResponseWriter, r *http.Request, questionId string) {
	// Open the SQLite database file
	db, err := sql.Open("sqlite3", "./satData.db")
	if err != nil {
		log.Printf("Error opening database: %v", err)
		http.Error(w, "Failed to open database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Query to get all the information about the selected question
	queryDetails := `
        SELECT questionId, id, test, category, domain, skill, difficulty, details, 
               question, answer_choices, answer, rationale 
        FROM sat_questions 
        WHERE questionId = ?`

	// Variable to store question details
	var (
		id, test, category, domain, skill, difficulty, details, question, answerChoices, answer, rationale string
	)

	// Execute the query and scan the result into the variables
	err = db.QueryRow(queryDetails, questionId).Scan(
		&id, &questionId, &test, &category, &domain, &skill, &difficulty, &details, &question, &answerChoices, &answer, &rationale,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Fprintln(w, "No question found with that ID.")
		} else {
			log.Printf("Error querying the database for questionId %s: %v", questionId, err)
			http.Error(w, "Error querying the database", http.StatusInternalServerError)
		}
		return
	}

	// Display the details of the selected question and the answer/rationale
	fmt.Fprintf(w, `
    <html><body>
    
    <p><strong>ID:</strong> %s</p>
    <p><strong>Test:</strong> %s</p>
    <p><strong>Category:</strong> %s</p>
    <p><strong>Domain:</strong> %s</p>
    <p><strong>Skill:</strong> %s</p>
    <p><strong>Difficulty:</strong> %s</p>
    <p><strong>Details:</strong> %s</p>
    <p><strong>Question:</strong> %s</p>
    <p><strong>Answer Choices:</strong> %s</p>
    <p><strong>Answer:</strong> %s</p>
    <p><strong>Rationale:</strong> %s</p>
    </body></html>
`, id, test, category, domain, skill, difficulty, details, question, answerChoices, answer, rationale)
}

func ServeForm(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, `
		<html>
		<body>
			<h1>Find Questions</h1>
			<form action="/sat/find-questions" method="post">
				Test: <input type="text" name="test"><br>
				Category: <input type="text" name="category"><br>
				Domain: <input type="text" name="domain"><br>
				Skill: <input type="text" name="skill"><br>
				Difficulty: <input type="text" name="difficulty"><br>
				<input type="submit" value="Submit">
			</form>
		</body>
		</html>
		`)
}

// Handle form submission and call findQuestions
func FindQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		// Extract form values
		test := r.FormValue("test")
		category := r.FormValue("category")
		domain := r.FormValue("domain")
		skill := r.FormValue("skill")
		difficulty := r.FormValue("difficulty")

		// Call the findQuestions function with the provided inputs
		findQuestions(w, r, test, category, domain, skill, difficulty)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

// Handle displaying details and answer for a specific question ID
func ViewQuestionDetailsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		// Get the questionId from the form
		questionID := r.FormValue("questionId")

		// Call the function to display question details and answer
		viewQuestionDetails(w, r, questionID)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}
