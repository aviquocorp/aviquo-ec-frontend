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


function displayQuestion(question) {
    // Update question number
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

    // Display question text
    questionDisplay.innerHTML = question.question || 'Question text not available';

    // Display metadata
    questionDetails.innerHTML = `
        <div>Difficulty: ${question.difficulty || 'N/A'}</div>
        <div>Category: ${question.category || 'N/A'}</div>
        <div>Domain: ${question.domain || 'N/A'}</div>
        <div>Skill: ${question.skill || 'N/A'}</div>
    `;

    // Clear previous answer choices
    answerContainer.innerHTML = '';

    // Display answer choices
    try {
        const choices = JSON.parse(question.answerChoices || '[]');
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'answer_button';
            button.textContent = `${String.fromCharCode(65 + index)}. ${choice.content}`;
            button.addEventListener('click', () => checkAnswer(choice.id, question.answer));
            answerContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error parsing answer choices:', error);
        answerContainer.innerHTML = 'Error loading answer choices';
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
    searchButton.addEventListener('click', handleSearch);

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

async function handleSearch() {
    const searchParams = {
        test: getSelectedValue('assessmentCheckboxes'),
        difficulty: getSelectedValues('difficultyCheckboxes'),
        subdomain: getSelectedSubdomains()
    };

    try {
        const response = await fetch('/sat/find-questions-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const questions = await response.json();
        currentQuestions = questions;
        currentQuestionIndex = 0;
        
        if (questions.length > 0) {
            displayQuestion(questions[0]);
        } else {
            displayNoQuestionsMessage();
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        displayErrorMessage();
    }
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

function displayQuestion(question) {
    document.getElementById('questionText').innerHTML = question.question;
    document.getElementById('questionDifficulty').textContent = `Difficulty: ${question.difficulty}`;
    document.getElementById('questionCategory').textContent = `Category: ${question.category}`;
    document.getElementById('questionDomain').textContent = `Domain: ${question.domain}`;
    document.getElementById('questionSkill').textContent = `Skill: ${question.skill}`;
    
    // Display answer choices
    const answerContainer = document.querySelector('.answer_container');
    answerContainer.innerHTML = '';
    
    if (question.answerChoices) {
        const choices = JSON.parse(question.answerChoices);
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'answer_button';
            button.textContent = `${String.fromCharCode(65 + index)}. ${choice.content}`;
            button.addEventListener('click', () => handleAnswerSelection(choice.id, question.answer));
            answerContainer.appendChild(button);
        });
    }

    // Update navigation buttons
    document.getElementById('prevQuestionBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextQuestionBtn').disabled = currentQuestionIndex === currentQuestions.length - 1;
}

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

function displayNoQuestionsMessage() {
    document.getElementById('questionText').innerHTML = 'No questions found matching your criteria.';
    document.querySelector('.answer_container').innerHTML = '';
}

function displayErrorMessage() {
    document.getElementById('questionText').innerHTML = 'Error fetching questions. Please try again.';
    document.querySelector('.answer_container').innerHTML = '';
}