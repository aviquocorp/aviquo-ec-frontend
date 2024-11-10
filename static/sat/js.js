// Get DOM elements
const searchButton = document.getElementById('searchButton');
const questionDisplay = document.getElementById('questionText');
const answerContainer = document.querySelector('.answer_container');
const questionNumber = document.getElementById('questionNumber');
const questionDetails = document.getElementById('questionDetails');
const nextButton = document.getElementById('nextQuestionBtn');
const prevButton = document.getElementById('prevQuestionBtn');
// Initialize state variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswer;

searchButton.addEventListener('click', searchQuestions);
async function searchQuestions() {
    questionDisplay.textContent = 'Loading questions...';
    
    const selectedTest = document.querySelector('#assessmentCheckboxes input:checked');
    if (!selectedTest) {
        questionDisplay.textContent = 'Please select a test type.';
        return;
    }

    const selectedSection = document.querySelector('#testSectionCheckboxes input:checked');
    if (!selectedSection) {
        questionDisplay.textContent = 'Please select a test section.';
        return;
    }

    // Get selected difficulties and wrap in an array if there's only one selection
    const selectedDifficulties = Array.from(document.querySelectorAll('#difficultyCheckboxes input:checked')).map(checkbox => checkbox.name);
    const difficulty = selectedDifficulties.length > 0 ? selectedDifficulties : [""];

    // Get selected subdomains and wrap in an array if there's only one selection
    const subdomainContainer = selectedSection.name === 'Reading and Writing' 
        ? '#readingWritingSubdomainCheckboxes' 
        : '#mathSubdomainCheckboxes';
    const selectedSubdomains = Array.from(document.querySelectorAll(`${subdomainContainer} input:checked`)).map(checkbox => checkbox.name);
    const subdomain = selectedSubdomains.length > 0 ? selectedSubdomains : [""];

    // Construct search payload ensuring difficulty and subdomain are always arrays
    const searchPayload = {
        test: selectedTest.name,
        difficulty: difficulty,
        subdomain: subdomain,
    };

    console.log('Sending search request with payload:', searchPayload);

    try {
        const response = await fetch('/sat/find-questions-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const questions = await response.json();
        currentQuestions = questions;
        currentQuestionIndex = 0;

        if (questions.length > 0) {
            displayQuestion(questions[0]);
            updateNavigationButtons();
        } else {
            displayNoResults();
        }

    } catch (error) {
        console.error('Error fetching questions:', error);
        displayError(error);
    }
}

function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === currentQuestions.length - 1;
}

function displayNoResults() {
    questionNumber.textContent = 'No Results';
    questionDisplay.textContent = 'No questions found matching your criteria. Please try different filters.';
    questionDetails.innerHTML = '';
    answerContainer.innerHTML = '';
    updateNavigationButtons();
}

function displayError(error) {
    questionNumber.textContent = 'Error';
    questionDisplay.textContent = 'An error occurred while fetching questions. Please try again.';
    questionDetails.innerHTML = `Error details: ${error.message}`;
    answerContainer.innerHTML = '';
    updateNavigationButtons();
}

// Navigation button event listeners
nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestions[currentQuestionIndex]);
        updateNavigationButtons();
    }
});

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestions[currentQuestionIndex]);
        updateNavigationButtons();
    }
});

// Event Listeners for checkbox containers
document.addEventListener('DOMContentLoaded', () => {
    // Assessment selection
    const assessmentCheckboxes = document.getElementById('assessmentCheckboxes');
    assessmentCheckboxes.addEventListener('change', handleAssessmentChange);

    // Test section selection
    const testSectionCheckboxes = document.getElementById('testSectionCheckboxes');
    testSectionCheckboxes.addEventListener('change', handleTestSectionChange);

    // Domain selections
    const readingDomainBtn = document.querySelector('#readingDomainCheckboxes .domain_button');
    const mathDomainBtn = document.querySelector('#mathDomainCheckboxes .domain_button');
    if (readingDomainBtn) readingDomainBtn.addEventListener('click', handleDomainSelection);
    if (mathDomainBtn) mathDomainBtn.addEventListener('click', handleDomainSelection);

    // Difficulty selection
    const difficultyBtn = document.querySelector('.difficulty_button');
    if (difficultyBtn) difficultyBtn.addEventListener('click', handleDifficultySelection);

    // Subdomain selection
    const subdomainBtns = document.querySelectorAll('.subdomain_button');
    subdomainBtns.forEach(btn => btn.addEventListener('click', handleSubdomainSelection));

    // Search button
    const searchButton = document.getElementById('searchButton');

    // Navigation buttons
    document.getElementById('prevQuestionBtn').addEventListener('click', showPreviousQuestion);
    document.getElementById('nextQuestionBtn').addEventListener('click', showNextQuestion);
});

// Handler Functions
function handleAssessmentChange(event) {
    const checkbox = event.target;
    if (checkbox.checked) {
        uncheckOtherCheckboxes(assessmentCheckboxes, checkbox);
        document.getElementById('testSectionCheckboxes').classList.remove('hidden');
    } else {
        document.getElementById('testSectionCheckboxes').classList.add('hidden');
    }
}

function handleTestSectionChange(event) {
    const checkbox = event.target;
    if (checkbox.checked) {
        uncheckOtherCheckboxes(testSectionCheckboxes, checkbox);
        const targetId = checkbox.getAttribute('data-target');
        
        // Hide all domain checkbox containers
        document.getElementById('readingDomainCheckboxes').classList.add('hidden');
        document.getElementById('mathDomainCheckboxes').classList.add('hidden');
        
        // Show the relevant domain checkboxes
        document.getElementById(targetId).classList.remove('hidden');
    }
}

function handleDomainSelection() {
    document.getElementById('difficultyCheckboxes').classList.remove('hidden');
}

function handleDifficultySelection() {
    const testSection = getSelectedValue('testSectionCheckboxes');
    if (testSection === 'Reading and Writing') {
        document.getElementById('readingWritingSubdomainCheckboxes').classList.remove('hidden');
    } else if (testSection === 'Math') {
        document.getElementById('mathSubdomainCheckboxes').classList.remove('hidden');
    }
    document.getElementById('excludeQuestions').classList.remove('hidden');
}

function handleSubdomainSelection() {
    document.getElementById('excludeQuestions').classList.remove('hidden');
}


// Helper Functions
function uncheckOtherCheckboxes(container, checkedBox) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
        if (box !== checkedBox) {
            box.checked = false;
        }
    });
}

function getSelectedValue(containerId) {
    const container = document.getElementById(containerId);
    const checkedBox = container.querySelector('input[type="checkbox"]:checked');
    return checkedBox ? checkedBox.name : null;
}

function getSelectedValues(containerId) {
    const container = document.getElementById(containerId);
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkedBoxes).map(box => box.name);
}

function getSelectedSubdomains() {
    const testSection = getSelectedValue('testSectionCheckboxes');
    const containerId = testSection === 'Reading and Writing' 
        ? 'readingWritingSubdomainCheckboxes' 
        : 'mathSubdomainCheckboxes';
    return getSelectedValues(containerId);
}
// First add MathJax CDN and configuration at the top of your file
const mathjaxScript = document.createElement('script');
mathjaxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js';
mathjaxScript.async = true;
document.head.appendChild(mathjaxScript);

// Add MathJax configuration
const mathjaxConfig = document.createElement('script');
mathjaxConfig.type = 'text/x-mathjax-config';
mathjaxConfig.text = `
    MathJax = {
        tex: {
            inlineMath: [['\\\\(', '\\\\)']],
            displayMath: [['\\\\[', '\\\\]']],
            processEscapes: true
        },
        options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
    };
`;
document.head.appendChild(mathjaxConfig);

// Update the displayQuestionDetails function to handle MathJax rendering
function displayQuestionDetails(question) {
    // Get the relevant DOM elements
    const questionText = document.getElementById('questionText');
    const questionDetails = document.getElementById('questionDetails');
    
    // Function to decode HTML entities and escaped Unicode
    function decodeText(text) {
        const textarea = document.createElement('textarea');
        return text
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            .replace(/\\u0026rsquo;/g, '\'')
            .replace(/\\u0026/g, '&')
            .replace(/\\"/g, '"')
            .split('\\n').join('\n'); // Handle newlines
    }

    // Check if details exist and create the content
    if (question.details) {
        let detailsDiv = document.querySelector('.question-details');
        if (!detailsDiv) {
            detailsDiv = document.createElement('div');
            detailsDiv.className = 'question-details';
        }
        
        const formattedDetails = decodeText(question.details);
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = formattedDetails;
        
        detailsDiv.innerHTML = '';
        detailsDiv.appendChild(contentWrapper);
        
        if (questionText.parentNode) {
            const existingDetails = document.querySelector('.question-details');
            if (existingDetails) {
                existingDetails.remove();
            }
            questionText.parentNode.insertBefore(detailsDiv, questionText);
            
            // Typeset the details with MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([detailsDiv]).catch((err) => console.error('MathJax error:', err));
            }
        }
    }
    
    // Update question metadata
    if (questionDetails) {
        const metadataHTML = `
            <div class="metadata-grid">
                <div class="metadata-item">
                    <span class="metadata-label">Difficulty:</span>
                    <span class="metadata-value">${question.difficulty || 'N/A'}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Category:</span>
                    <span class="metadata-value">${question.category || 'N/A'}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Domain:</span>
                    <span class="metadata-value">${question.domain || 'N/A'}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Skill:</span>
                    <span class="metadata-value">${question.skill || 'N/A'}</span>
                </div>
            </div>
        `;
        questionDetails.innerHTML = metadataHTML;
    }

    try {
        if (question.question) {
            const decodedQuestion = decodeText(question.question);
            questionText.innerHTML = decodedQuestion;
            
            // Typeset the question text with MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([questionText]).catch((err) => console.error('MathJax error:', err));
            }
        }
    } catch (error) {
        console.error('Error displaying question details:', error);
        questionText.innerHTML = 'Error displaying question. Please try again.';
    }
}

// Update the displayQuestion function to handle MathJax in answer choices
function displayQuestion(question) {
    clearFeedback();

    document.getElementById('questionText').innerHTML = question.question;
    document.getElementById('questionDifficulty').textContent = `Difficulty: ${question.difficulty}`;
    document.getElementById('questionCategory').textContent = `Category: ${question.category}`;
    document.getElementById('questionDomain').textContent = `Domain: ${question.domain}`;
    document.getElementById('questionSkill').textContent = `Skill: ${question.skill}`;
    
    displayQuestionDetails(question);

    const answerContainer = document.querySelector('.answer_container');
    answerContainer.innerHTML = '';
    
    let choices = [];
    try {
        if (Array.isArray(question.answerChoices)) {
            choices = question.answerChoices;
        } else if (typeof question.answerChoices === 'string') {
            choices = JSON.parse(question.answerChoices);
        }
    } catch (e) {
        console.error('Error parsing answer choices:', e);
        choices = [];
    }

    const letterMapping = {
        '0': 'A',
        '1': 'B',
        '2': 'C',
        '3': 'D'
    };

    if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'answer_button';
            
            let content = choice.content;
            content = content.replace(/<[^>]*>/g, '');
            content = content.replace(/(\d+),(\d+)/, (match, p1, p2) => {
                return `$${p1},${p2} per month`;
            });

            const letter = letterMapping[index.toString()];
            button.innerHTML = `${letter}. ${content}`;
            
            button.addEventListener('click', () => checkButtonAnswer(letter, question.answer, question));
            answerContainer.appendChild(button);
        });

        // Typeset the answer choices with MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([answerContainer]).catch((err) => console.error('MathJax error:', err));
        }
    } else {
        // Handle free response questions...
        const inputContainer = document.createElement('div');
        inputContainer.className = 'answer-input-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'user-answer-input';
        input.className = 'answer-input';
        input.placeholder = 'Type your answer here...';
        
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Answer';
        submitButton.className = 'submit-answer-button';
        submitButton.addEventListener('click', () => {
            const userAnswer = input.value.trim();
            // Handle answer submission
        });
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitButton);
        answerContainer.appendChild(inputContainer);
    }

    // Update navigation buttons
    document.getElementById('prevQuestionBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextQuestionBtn').disabled = currentQuestionIndex === currentQuestions.length - 1;
}
function clearFeedback() {
    const feedback = document.getElementById('feedback');
    const correctness = document.getElementById('correctness');
    const rationaleElement = document.getElementById('question-rationale');
    
    if (feedback) {
        // Clear all MathJax elements within feedback
        const mathJaxElements = feedback.querySelectorAll('.MathJax');
        mathJaxElements.forEach(element => element.remove());
        
        // Clear MathJax processing queue for this element
        if (window.MathJax) {
            try {
                window.MathJax.typesetClear([feedback]);
            } catch (err) {
                console.error('Error clearing MathJax:', err);
            }
        }
        
        feedback.style.display = 'none';
    }
    
    if (correctness) {
        // Clear MathJax elements in correctness
        const mathJaxElements = correctness.querySelectorAll('.MathJax');
        mathJaxElements.forEach(element => element.remove());
        
        correctness.textContent = '';
        correctness.className = '';
    }
    
    if (rationaleElement) {
        // Clear MathJax elements in rationale
        const mathJaxElements = rationaleElement.querySelectorAll('.MathJax');
        mathJaxElements.forEach(element => element.remove());
        
        // Clear MathJax processing queue for rationale
        if (window.MathJax) {
            try {
                window.MathJax.typesetClear([rationaleElement]);
            } catch (err) {
                console.error('Error clearing MathJax:', err);
            }
        }
        
        rationaleElement.innerHTML = '';
    }
}

function checkButtonAnswer(selectedAnswer, correctAnswer, question) {
    // Get all answer buttons
    const allButtons = document.querySelectorAll('.answer_button');
    
    // Reset all buttons to default state
    allButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.style.backgroundColor = '';
        button.style.color = '';
    });

    // Get feedback elements
    const feedback = document.getElementById('feedback');
    const correctness = document.getElementById('correctness');
    
    // Find the selected button based on the letter (A, B, C, D)
    const selectedButton = Array.from(allButtons).find(button => 
        button.textContent.startsWith(selectedAnswer)
    );
    
    if (selectedButton) {
        feedback.style.display = 'block';
        
        // Clear any existing rationale
        let rationaleElement = document.getElementById('question-rationale');
        if (!rationaleElement) {
            rationaleElement = document.createElement('div');
            rationaleElement.id = 'question-rationale';
            feedback.appendChild(rationaleElement);
        }
        
        // Compare the selected answer letter with the correct answer letter
        if (selectedAnswer === correctAnswer) {
            // Correct answer case
            selectedButton.classList.add('correct');
            correctness.textContent = 'Correct!';
            correctness.className = 'correct';
        } else {
            // Incorrect answer case
            selectedButton.classList.add('incorrect');
            correctness.textContent = 'Incorrect. Try again.';
            correctness.className = 'incorrect';
        }

        // Display rationale if it exists
        if (question && question.rationale) {
            rationaleElement.innerHTML = `
                <div class="rationale-container">
                    <h3>Explanation:</h3>
                    <p>${question.rationale}</p>
                </div>
            `;
        }
    }

    // Log for debugging
    console.log('Selected Answer:', selectedAnswer);
    console.log('Correct Answer:', correctAnswer);
    console.log('Is Correct:', selectedAnswer === correctAnswer);

    // Add styles if they haven't been added yet
    if (!document.querySelector('#answer-button-styles')) {
        const style = document.createElement('style');
        style.id = 'answer-button-styles';
        style.textContent = `
            .answer_button {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                font-size: 16px;
            }

            .answer_button:hover {
                background-color: #f0f0f0;
            }

            .answer_button.correct {
                background-color: #d4edda !important;
                border-color: #c3e6cb !important;
                color: #155724 !important;
            }

            .answer_button.incorrect {
                background-color: #f8d7da !important;
                border-color: #f5c6cb !important;
                color: #721c24 !important;
            }

            #feedback {
                margin-top: 10px;
                padding: 10px;
                border-radius: 4px;
            }

            .correct {
                color: #155724;
                background-color: #d4edda;
                border-color: #c3e6cb;
            }

            .incorrect {
                color: #721c24;
                background-color: #f8d7da;
                border-color: #f5c6cb;
            }

            .rationale-container {
                margin-top: 15px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border-left: 4px solid #0d6efd;
            }

            .rationale-container h3 {
                margin-top: 0;
                color: #0d6efd;
                font-size: 1.1em;
            }

            .rationale-container p {
                margin: 10px 0 0;
                line-height: 1.5;
                color: #212529;
            }
        `;
        document.head.appendChild(style);
    }
}


function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestions[currentQuestionIndex]);
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestions[currentQuestionIndex]);
    }
}