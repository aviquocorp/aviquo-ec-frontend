// Get DOM elements for sections
const testSectionCheckboxes = document.getElementById('testSectionCheckboxes');
const difficultyCheckboxes = document.getElementById('difficultyCheckboxes');
const readingWritingSubdomainCheckboxes = document.getElementById('readingWritingSubdomainCheckboxes');
const mathSubdomainCheckboxes = document.getElementById('mathSubdomainCheckboxes');
const testSectionButton = document.querySelector('.test_section_button');

// Get DOM elements for question display
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

// Add click event listener to test section checkboxes
testSectionCheckboxes.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        // Uncheck other checkboxes in the same container
        const checkboxes = testSectionCheckboxes.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox !== e.target) {
                checkbox.checked = false;
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('popupModal');
    const openBtn = document.getElementById('openPopupBtn');
    const closeBtn = document.getElementById('closePopupBtn');

    // Open modal when feedback button is clicked
    openBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
// Add click event listener to the test section next button
testSectionButton.addEventListener('click', function() {
    // Get the selected checkbox
    const selectedCheckbox = testSectionCheckboxes.querySelector('input[type="checkbox"]:checked');
    
    if (!selectedCheckbox) {
        alert('Please select a test section before proceeding.');
        return;
    }

    // Hide the test section checkboxes
    // is this necessary?
    // testSectionCheckboxes.classList.add('hidden');

    // Show the difficulty section
    difficultyCheckboxes.classList.remove('hidden');

    // Store the selected section for later use
    const selectedSection = selectedCheckbox.name;

    // Store which subdomain checkboxes to show later
    if (selectedSection === 'Reading and Writing') {
        readingWritingSubdomainCheckboxes.dataset.show = 'true';
        mathSubdomainCheckboxes.dataset.show = 'false';
    } else if (selectedSection === 'Math') {
        readingWritingSubdomainCheckboxes.dataset.show = 'false';
        mathSubdomainCheckboxes.dataset.show = 'true';
    }
});


const scrollStyles = document.createElement('style');
scrollStyles.textContent = `
    .mainContent {
        scroll-behavior: smooth;
    }
    .right-side {
        scroll-behavior: smooth;
    }
    .container {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(scrollStyles);

// Replace the existing scrollToTop function with this improved version

searchButton.addEventListener('click', searchQuestions);
function scrollToTop() {
    // Force layout recalculation
    document.body.offsetHeight;
    
    // Scroll window
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Get all scrollable containers
    const containers = [
        document.querySelector('.mainContent'),
        document.querySelector('.container'),
        document.querySelector('.right-side'),
        document.documentElement,
        document.body
    ].filter(Boolean); // Remove null elements
    
    // Scroll each container
    containers.forEach(container => {
        // Check if element is scrollable
        if (container.scrollHeight > container.clientHeight) {
            container.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // Fallback for older browsers or if smooth scroll fails
    const fallbackScroll = () => {
        window.scrollTo(0, 0);
        containers.forEach(container => {
            container.scrollTop = 0;
        });
    };
    
    // Set both immediate and delayed fallbacks
    fallbackScroll();
    setTimeout(fallbackScroll, 100);
    
    // Force scroll position with a slight delay to ensure it takes effect
    setTimeout(() => {
        containers.forEach(container => {
            container.scrollTop = 0;
        });
    }, 150);
}

async function searchQuestions() {

    scrollToTop();
    await new Promise(resolve => setTimeout(resolve, 100));

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
    
        
        // Show the relevant domain checkboxes
        document.getElementById(targetId).classList.remove('hidden');
    }
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

function createFreeResponseInput(container, question) {
    const responseWrapper = document.createElement('div');
    responseWrapper.className = 'free-response-wrapper';

    const responseInput = document.createElement(question.multiline ? 'textarea' : 'input');
    responseInput.className = 'free-response-input';
    responseInput.placeholder = question.placeholder || 'Enter your answer here...';
    
    if (question.multiline) {
        responseInput.rows = 4;
    }

    const submitButton = document.createElement('button');
    submitButton.className = 'submit-button';
    submitButton.textContent = 'Submit Answer';

    let submitted = false;
    
    submitButton.addEventListener('click', () => {
        if (submitted) return;
        
        const response = responseInput.value.trim();
        if (!response) {
            showFeedback('Please enter an answer before submitting.', 'warning');
            return;
        }

        submitted = true;
        responseInput.disabled = true;
        submitButton.disabled = true;
        
        checkFreeResponseAnswer(response, question);
    });

    if (question.optional) {
        const skipButton = document.createElement('button');
        skipButton.className = 'skip-button';
        skipButton.textContent = 'Skip Question';
        skipButton.addEventListener('click', () => {
            responseWrapper.innerHTML = '<p class="skipped-message">Question skipped</p>';
            submitButton.disabled = true;
            markQuestionSkipped(question.id);
        });
        responseWrapper.appendChild(skipButton);
    }

    responseWrapper.appendChild(responseInput);
    responseWrapper.appendChild(submitButton);
    container.appendChild(responseWrapper);

    addFreeResponseStyles();
}
// Update the displayQuestion function to handle MathJax in answer choices
function displayQuestion(question) {
    console.log('Question payload:', {
        fullQuestion: question,
        questionText: question.question,
        answerChoices: question.answerChoices,
        parsedChoices: (() => {
            try {
                if (typeof question.answerChoices === 'string') {
                    return JSON.parse(question.answerChoices);
                }
                return question.answerChoices;
            } catch (e) {
                return `Error parsing choices: ${e.message}`;
            }
        })()
    });

    clearFeedback();

    // Update question metadata
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    
    if (questionNumber) {
        questionNumber.textContent = `Question ${currentQuestionIndex} of ${currentQuestions.length}`;
    }

    if (questionText && question.question) {
        questionText.innerHTML = decodeText(question.question);
        if (window.MathJax) {
            MathJax.typesetPromise([questionText]).catch((err) => console.error('MathJax error:', err));
        }
    }

    displayQuestionDetails(question);

    if (question.type === 'free-response') {
        createFreeResponseInput(answerContainer, question);
    } 

    const answerContainer = document.querySelector('.answer_container');
    if (!answerContainer) return;
    answerContainer.innerHTML = '';


    let choices = [];
    try {
        if (Array.isArray(question.answerChoices)) {
            choices = question.answerChoices;
        } 
        else if (typeof question.answerChoices === 'string') {
            const parsed = JSON.parse(question.answerChoices);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                choices = Object.entries(parsed).map(([key, value]) => ({
                    content: value.body || value.content || value,
                    letter: key.toUpperCase()
                }));
            } else {
                choices = parsed;
            }
        }
        else if (typeof question.answerChoices === 'object' && question.answerChoices !== null) {
            const letters = ['a', 'b', 'c', 'd'];
            choices = letters.map(letter => {
                if (question.answerChoices[letter] && question.answerChoices[letter].body) {
                    return {
                        letter: letter.toUpperCase(),
                        content: question.answerChoices[letter].body
                    };
                }
                return null;
            }).filter(choice => choice !== null);
        }
    } catch (e) {
        console.error('Error parsing answer choices:', e);
        choices = [];
    }

    function decodeText(text) {
        if (!text) return '';
        const decoded = text
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            .replace(/\\u0026rsquo;/g, '\'')
            .replace(/\\u0026/g, '&')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(' comma ', ',');
        return decoded;
    }

    if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'answer_button';
            
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-option';
            
            let content = '';
            
            if (typeof choice === 'object') {
                content = choice.content || choice.body || '';
                if (typeof content === 'object' && content.body) {
                    content = content.body;
                }
            } else {
                content = choice;
            }
            
            content = decodeText(content);
            
            // Instead of removing HTML tags, properly render them
            const letter = choice.letter || String.fromCharCode(65 + index);
            
            // Create a wrapper for the content
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'answer-content';
            contentWrapper.innerHTML = `${letter}. ${content}`;
            
            // Process any math-container or math-img elements
            const mathContainers = contentWrapper.querySelectorAll('.math-container');
            mathContainers.forEach(container => {
                const img = container.querySelector('img');
                if (img) {
                    img.style.display = 'inline-block';
                    img.style.verticalAlign = 'middle';
                    img.style.maxWidth = '100%';
                }
            });
            
            answerDiv.appendChild(contentWrapper);
            button.appendChild(answerDiv);
            button.addEventListener('click', () => checkButtonAnswer(letter, question.answer, question));
            answerContainer.appendChild(button);
        });

        // Add enhanced styles for images in answers
        if (!document.querySelector('#answer-styles')) {
            const style = document.createElement('style');
            style.id = 'answer-styles';
            style.textContent = `
                .answer_button {
                    width: 100%;
                    background: white;
                    border: none;
                    margin-bottom: 8px;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                }

                .answer-option {
                    width: 100%;
                    padding: 12px 15px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    text-align: left;
                    font-size: 16px;
                    color: black;
                    line-height: 1.4;
                }

                .answer-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .math-container {
                    display: inline-block;
                    vertical-align: middle;
                }

                .math-img {
                    max-width: 100%;
                    height: auto;
                }

                .answer_button:hover .answer-option {
                    background-color: #f8f9fa;
                    border-color: #adb5bd;
                }

                .answer_button.correct .answer-option {
                    background-color: #d4edda;
                    border-color: #c3e6cb;
                    color: #155724;
                }

                .answer_button.incorrect .answer-option {
                    background-color: #f8d7da;
                    border-color: #f5c6cb;
                    color: #721c24;
                }
            `;
            document.head.appendChild(style);
        }

        if (window.MathJax) {
            MathJax.typesetPromise([answerContainer]).catch((err) => console.error('MathJax error:', err));
        }
    } else {
        // Handle free response questions...
        const inputContainer = document.createElement('div');
        inputContainer.className = 'answer-input-container';
        
        const inputForm = document.createElement('form');
        inputForm.onsubmit = (e) => {
            e.preventDefault();
            const userAnswer = input.value.trim();
            checkFreeResponseAnswer(userAnswer, question.answer, question);
        };
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'user-answer-input';
        input.className = 'answer-input';
        input.placeholder = 'Type your answer here...';
        input.required = true;

        
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Answer';
        submitButton.className = 'submit-answer-button';
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitButton);
        answerContainer.appendChild(inputContainer);

        const style = document.createElement('style');
        style.textContent = `
            .answer-input-container {
                margin: 20px 0;
                width: 100%;
            }
            
            .answer-input {
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                border: 2px solid #ccc;
                border-radius: 4px;
                font-size: 16px;
            }
            
            .answer-input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
            }
            
            .submit-answer-button {
                width: 100%;
                padding: 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .submit-answer-button:hover {
                background-color: #0056b3;
            }
            
            .submit-answer-button:disabled {
                background-color: #ccc;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(style);
        
        inputForm.appendChild(input);
        inputForm.appendChild(submitButton);
        inputContainer.appendChild(inputForm);
        answerContainer.appendChild(inputContainer);
        
        // Focus the input field
        input.focus();
    }

    const prevButton = document.getElementById('prevQuestionBtn');
    const nextButton = document.getElementById('nextQuestionBtn');
    
    if (prevButton) {
        prevButton.disabled = currentQuestionIndex === 0;
    }
    if (nextButton) {
        nextButton.disabled = currentQuestionIndex === currentQuestions.length - 1;
    }
}
function checkFreeResponseAnswer(userAnswer, correctAnswer, question) {
    // Ensure feedback styles are added
    addFeedbackStyles();
    
    const feedback = document.getElementById('feedback');
    const correctness = document.getElementById('correctness');
    
    feedback.style.display = 'block';
    
    // Clean up and normalize answers
    const normalizedUserAnswer = userAnswer.toLowerCase().trim().replace(/\s+/g, '');
    
    function fractionToDecimal(fraction) {
        if (!isNaN(fraction)) {
            return parseFloat(fraction);
        }
        
        const parts = fraction.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                return numerator / denominator;
            }
        }
        return NaN;
    }
    
    const userDecimal = fractionToDecimal(normalizedUserAnswer);
    const correctDecimal = fractionToDecimal(correctAnswer);
    
    const tolerance = 0.0001;
    const isCorrect = Math.abs(userDecimal - correctDecimal) < tolerance;
    
    // Update correctness display with proper styling
    correctness.textContent = isCorrect ? 'Correct!' : 'Incorrect. Try again.';
    correctness.className = isCorrect ? 'correct' : 'incorrect';
    
    // Create or update rationale element
    let rationaleElement = document.getElementById('question-rationale');
    if (!rationaleElement) {
        rationaleElement = document.createElement('div');
        rationaleElement.id = 'question-rationale';
        feedback.appendChild(rationaleElement);
    }
    
    if (question && question.rationale) {
        rationaleElement.innerHTML = `
            <div class="rationale-container">
                <h3>Explanation:</h3>
                <p>${question.rationale}</p>
            </div>
        `;
    }
    
    // Typeset MathJax content if present
    if (window.MathJax) {
        MathJax.typesetPromise([rationaleElement]).catch((err) => 
            console.error('MathJax error:', err)
        );
    }
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
    // Ensure feedback styles are added
    addFeedbackStyles();
    
    const allButtons = document.querySelectorAll('.answer_button');
    allButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.style.backgroundColor = '';
        button.style.color = '';
    });

    const feedback = document.getElementById('feedback');
    const correctness = document.getElementById('correctness');
    
    const selectedButton = Array.from(allButtons).find(button => 
        button.textContent.startsWith(selectedAnswer)
    );
    
    if (selectedButton) {
        feedback.style.display = 'block';
        
        let rationaleElement = document.getElementById('question-rationale');
        if (!rationaleElement) {
            rationaleElement = document.createElement('div');
            rationaleElement.id = 'question-rationale';
            feedback.appendChild(rationaleElement);
        }
        
        if (selectedAnswer === correctAnswer) {
            selectedButton.classList.add('correct');
            correctness.textContent = 'Correct!';
            correctness.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect');
            correctness.textContent = 'Incorrect. Try again.';
            correctness.className = 'incorrect';
        }

        if (question && question.rationale) {
            rationaleElement.innerHTML = `
                <div class="rationale-container">
                    <h3>Explanation:</h3>
                    <p>${question.rationale}</p>
                </div>
            `;
        }
        
        if (window.MathJax) {
            MathJax.typesetPromise([rationaleElement]).catch((err) => 
                console.error('MathJax error:', err)
            );
        }
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
        currentQuestionIndex;
        displayQuestion(currentQuestions[currentQuestionIndex]);
    }
}

function addFeedbackStyles() {
    if (!document.querySelector('#feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'feedback-styles';
        style.textContent = `
            #feedback {
                margin-top: 10px;
                padding: 10px;
                border-radius: 4px;
            }

            .correct {
                color: #155724;
                background-color: #d4edda;
                border-color: #c3e6cb;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
            }

            .incorrect {
                color: #721c24;
                background-color: #f8d7da;
                border-color: #f5c6cb;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
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
