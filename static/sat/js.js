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

function checkAnswer(selectedId, correctAnswer) {
    // Reset previous feedback
    const allButtons = document.querySelectorAll('.answer_button');
    allButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
    });

    // Find and update selected button
    const selectedButton = Array.from(allButtons).find(button => 
        button.textContent.startsWith(String.fromCharCode(65 + selectedId))
    );

    if (selectedButton) {
        if (selectedId === correctAnswer) {
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }
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
//TODO: Display the passage
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
            // Add more replacements as needed
            .split('\\n').join('\n'); // Handle newlines
    }

    // Check if details exist and create the content
    if (question.details) {
        // Create a details container if it doesn't exist
        let detailsDiv = document.querySelector('.question-details');
        if (!detailsDiv) {
            detailsDiv = document.createElement('div');
            detailsDiv.className = 'question-details';
        }
        
        // Decode and format the details text
        const formattedDetails = decodeText(question.details);
        
        // Create a wrapper for the decoded content
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = formattedDetails;
        
        // Clear existing content and append new content
        detailsDiv.innerHTML = '';
        detailsDiv.appendChild(contentWrapper);
        
        // Insert the details before the question text
        if (questionText.parentNode) {
            // Remove any existing details first
            const existingDetails = document.querySelector('.question-details');
            if (existingDetails) {
                existingDetails.remove();
            }
            questionText.parentNode.insertBefore(detailsDiv, questionText);
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

    // Add error handling
    try {
        // Parse and display the question text
        if (question.question) {
            const decodedQuestion = decodeText(question.question);
            questionText.innerHTML = decodedQuestion;
        }
    } catch (error) {
        console.error('Error displaying question details:', error);
        questionText.innerHTML = 'Error displaying question. Please try again.';
    }
}

function displayQuestion(question) {
    document.getElementById('questionText').innerHTML = question.question;
    document.getElementById('questionDifficulty').textContent = `Difficulty: ${question.difficulty}`;
    document.getElementById('questionCategory').textContent = `Category: ${question.category}`;
    document.getElementById('questionDomain').textContent = `Domain: ${question.domain}`;
    document.getElementById('questionSkill').textContent = `Skill: ${question.skill}`;
    displayQuestionDetails(question);

    // Display answer choices
    const answerContainer = document.querySelector('.answer_container');
    answerContainer.innerHTML = '';
    
    // Safely parse the answer choices
    let choices = [];
    try {
        // Check if answerChoices is already an array
        if (Array.isArray(question.answerChoices)) {
            choices = question.answerChoices;
        } else if (typeof question.answerChoices === 'string') {
            choices = JSON.parse(question.answerChoices);
        }
    } catch (e) {
        console.error('Error parsing answer choices:', e);
        // Provide a default set of choices if parsing fails
        choices = [];
    }

    // Ensure choices is an array before using forEach
    if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'answer_button';
            
            // Format the monetary value
            let content = choice.content;
            // Remove HTML tags and format as currency
            content = content.replace(/<[^>]*>/g, '');
            content = content.replace(/(\d+),(\d+)/, (match, p1, p2) => {
                return `$${p1},${p2} per month`;
            });
            
            button.innerHTML = `${String.fromCharCode(65 + index)}. ${content}`;
            button.addEventListener('click', () => handleAnswerSelection(choice.id, question.answer));
            answerContainer.appendChild(button);
        });
    } else {
        console.warn('No valid answer choices found for question');
    }

    // Update navigation buttons
    document.getElementById('prevQuestionBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextQuestionBtn').disabled = currentQuestionIndex === currentQuestions.length - 1;
}

// Rest of the functions remain the same...
function handleAnswerSelection(selectedId, correctAnswer) {
    const feedback = document.getElementById('feedback');
    const correctness = document.getElementById('correctness');
    
    feedback.style.display = 'block';
    if (selectedId === correctAnswer) {
        correctness.textContent = 'Correct!';
        correctness.className = 'correct';
    } else {
        correctness.textContent = 'Incorrect. Try again.';
        correctness.className = 'incorrect';
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