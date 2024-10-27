package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func indexSat(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/
	http.ServeFile(w, r, "./static/sat/pages/practice.html")
}

func findQuestions(w http.ResponseWriter, r *http.Request, test, category, domain, skill, difficulty string) {
    var err error

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

	// Collect matching question IDs
	var questionId string
	matchingQuestions := []string{}
	for rows.Next() {
		err := rows.Scan(&questionId)
		if err != nil {
			log.Fatal(err)
		}
		matchingQuestions = append(matchingQuestions, questionId)
	}


	if len(matchingQuestions) > 0 {
		viewQuestionDetails(w, matchingQuestions)
	} else {
		fmt.Fprintln(w, `<html><body>No questions found matching the filters.</body></html>`)
	}
}

// viewQuestionDetails handles displaying all information for each questionId in matchingQuestions

func viewQuestionDetails(w http.ResponseWriter, matchingQuestions []string) {
    var err error

	// JSON struct to hold question details
	type QuestionDetails struct {
		QuestionID    string `json:"questionId"`
		ID            string `json:"id"`
		Test          string `json:"test"`
		Category      string `json:"category"`
		Domain        string `json:"domain"`
		Skill         string `json:"skill"`
		Difficulty    string `json:"difficulty"`
		Details       string `json:"details"`
		Question      string `json:"question"`
		AnswerChoices string `json:"answerChoices"`
		Answer        string `json:"answer"`
		Rationale     string `json:"rationale"`
	}

	// Slice to store details of all matching questions
	var questions []QuestionDetails

	for _, questionId := range matchingQuestions {
		
		queryDetails := `
			SELECT questionId, id, test, category, domain, skill, difficulty, details, 
				question, answer_choices, answer, rationale 
			FROM sat_questions 
			WHERE questionId = ?`

		// Stores question details
		var question QuestionDetails

		// Execute the query and scan the result into the struct
		err = db.QueryRow(queryDetails, questionId).Scan(
			&question.QuestionID, &question.ID, &question.Test, &question.Category, &question.Domain,
			&question.Skill, &question.Difficulty, &question.Details, &question.Question,
			&question.AnswerChoices, &question.Answer, &question.Rationale,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("No question found with ID: %s", questionId)
				continue
			} else {
				log.Printf("Error querying the database for questionId %s: %v", questionId, err)
				http.Error(w, "Error querying the database", http.StatusInternalServerError)
				return
			}
		}

		// Append the question details to the slice
		questions = append(questions, question)
	}

	// Convert the slice of questions to a JSON string
	jsonData, err := json.Marshal(questions)
	if err != nil {
		log.Printf("Error converting questions to JSON: %v", err)
		http.Error(w, "Error generating JSON response", http.StatusInternalServerError)
		return
	}

	
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
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
		category := r.Formalue("category")
		domain := r.FormValue("domain")
		skill := r.FormValue("skill")
		difficulty := r.FormValue("difficulty")

		// Call the findQuestions function with the provided inputs
		findQuestions(w, r, test, category, domain, skill, difficulty)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func FindQuestionsHandlerv2(w http.ResponseWriter, r *http.Request) {
    // parse JSON in the form of
    // {
    //      "SAT": { 
    //          "difficulty": ["Medium", "Hard"],
    //          "Math" : { 
    //              "Algebra" : ["Linear Equations", "Systems of Equations"],
    //              "Advanced Math": ["Functions"],
    //          } 
    //          "Reading and Writing": {
    //              "Information and Ideas" : ["Central Ideas and Details"],
    //          }
    //      }
    // }
    var input map[string]string
} 

func initializeSat(db *sql.DB) {
    // create table if not exists
    _, err := db.Exec(`CREATE TABLE IF NOT EXISTS sat_questions (
        questionId TEXT PRIMARY KEY,
        id TEXT,
        test TEXT,
        category TEXT,
        domain TEXT,
        skill TEXT,
        difficulty TEXT,
        details TEXT,
        question TEXT,
        answer_choices TEXT,
        answer TEXT,
        rationale TEXT
    )`)
    if err != nil {
        log.Fatal(err)
    }

    http.HandleFunc("/sat", indexSat)
	http.HandleFunc("/sat/test", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
}
