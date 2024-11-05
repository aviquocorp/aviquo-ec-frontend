document.addEventListener("DOMContentLoaded", function() {
    // Store all selected values
    const selectedValues = {
        test: "",
        sections: [],
        domains: [],
        difficulties: [],
        subdomains: []
    };

    // Define all possible subdomains for validation and reference
    const allSubdomains = {
        "Reading and Writing": [
            "Inferences",
            "Central Ideas and Details",
            "Command of Evidence",
            "Words in Context",
            "Text Structure and Purpose",
            "Cross-Text Connections",
            "Cross-text Connections",
            "Rhetorical Synthesis",
            "Transitions",
            "Boundaries",
            "Form, Structure, and Sense"
        ],
        "Math": [
            "Linear equations in two variables",
            "Linear inequalities in one or two variables",
            "Systems of two linear equations in two variables",
            "Linear functions",
            "Linear equations in one variable",
            "Nonlinear functions",
            "Equivalent expressions",
            "Nonlinear equations in one variable and systems of equations in two variables",
            "Inference from sample statistics and margin of error",
            "Ratios, rates, proportional relationships, and units",
            "Probability and conditional probability",
            "Percentages",
            "Two-variable data: Models and scatterplots",
            "One-variable data: Distributions and measures of center and spread",
            "Evaluating statistical claims: Observational studies and experiments",
            "Lines, angles, and triangles",
            "Right triangles and trigonometry",
            "Area and volume",
            "Circles"
        ]
    };

    // Get DOM elements
    const elements = {
        assessmentCheckboxes: document.querySelectorAll("#assessmentCheckboxes input[type='checkbox']"),
        testSectionCheckboxes: document.getElementById("testSectionCheckboxes"),
        testSectionInputs: document.querySelectorAll("#testSectionCheckboxes input[type='checkbox']"),
        readingDomainCheckboxes: document.getElementById("readingDomainCheckboxes"),
        mathDomainCheckboxes: document.getElementById("mathDomainCheckboxes"),
        difficultyCheckboxes: document.getElementById("difficultyCheckboxes"),
        difficultyInputs: document.querySelectorAll("#difficultyCheckboxes input[type='checkbox']"),
        readingWritingSubdomainCheckboxes: document.getElementById('readingWritingSubdomainCheckboxes'),
        mathSubdomainCheckboxes: document.getElementById('mathSubdomainCheckboxes'),
        excludeQuestions: document.getElementById("excludeQuestions"),
        searchButton: document.getElementById("searchButton"),
        prevQuestionBtn: document.getElementById('prevQuestionBtn'),
        nextQuestionBtn: document.getElementById('nextQuestionBtn')
    };

    // Initially hide sections
    elements.excludeQuestions.style.display = "none";
    elements.testSectionCheckboxes.style.display = "none";
    elements.readingDomainCheckboxes.style.display = "none";
    elements.mathDomainCheckboxes.style.display = "none";
    elements.difficultyCheckboxes.style.display = "none";
    elements.readingWritingSubdomainCheckboxes.style.display = "none";
    elements.mathSubdomainCheckboxes.style.display = "none";

    // Helper function to get checked values from checkboxes
    function getCheckedValues(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.name);
    }

    // Helper function to hide all domain options
    function hideAllDomainOptions() {
        elements.readingDomainCheckboxes.style.display = "none";
        elements.mathDomainCheckboxes.style.display = "none";
        elements.difficultyCheckboxes.style.display = "none";
        elements.readingWritingSubdomainCheckboxes.style.display = "none";
        elements.mathSubdomainCheckboxes.style.display = "none";
        elements.excludeQuestions.style.display = "none";
    }

    // Update selected values when assessment changes
    elements.assessmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            selectedValues.test = checkbox.checked ? checkbox.name : "";
            elements.testSectionCheckboxes.style.display = checkbox.checked ? "block" : "none";
            
            if (checkbox.checked) {
                elements.testSectionCheckboxes.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Reset all selections when assessment is unchecked
                Object.keys(selectedValues).forEach(key => {
                    if (Array.isArray(selectedValues[key])) {
                        selectedValues[key] = [];
                    }
                });
                hideAllDomainOptions();
            }
        });
    });

    // Update selected values when test sections change
    elements.testSectionInputs.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            hideAllDomainOptions();
            selectedValues.sections = getCheckedValues(elements.testSectionInputs);
            
            if (checkbox.checked) {
                const targetId = checkbox.getAttribute("data-target");
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.style.display = "block";
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Handle domain button clicks
    document.querySelectorAll('.domain_button').forEach(button => {
        button.addEventListener('click', function() {
            const currentDomainCheckboxes = this.parentNode;
            if (currentDomainCheckboxes.style.display === 'block') {
                elements.difficultyCheckboxes.style.display = 'block';
                elements.difficultyCheckboxes.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle difficulty button click
    document.querySelector('.difficulty_button')?.addEventListener('click', function() {
        const selectedTestSection = Array.from(elements.testSectionInputs).find(cb => cb.checked);
        
        selectedValues.difficulties = getCheckedValues(elements.difficultyInputs);

        if (selectedTestSection) {
            if (selectedTestSection.name === "Reading and Writing") {
                elements.readingWritingSubdomainCheckboxes.style.display = 'block';
                elements.readingWritingSubdomainCheckboxes.scrollIntoView({ behavior: 'smooth' });
            } else if (selectedTestSection.name === "Math") {
                elements.mathSubdomainCheckboxes.style.display = 'block';
                elements.mathSubdomainCheckboxes.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Handle subdomain button clicks
    document.querySelectorAll('.subdomain_button').forEach(button => {
        button.addEventListener('click', function() {
            elements.excludeQuestions.style.display = "block";
            elements.excludeQuestions.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Handle subdomain selection
    document.querySelectorAll('#readingWritingSubdomainCheckboxes input[type="checkbox"], #mathSubdomainCheckboxes input[type="checkbox"]')
        .forEach(checkbox => {
            checkbox.addEventListener("change", function() {
                const readingWritingSubdomains = getCheckedValues(
                    document.querySelectorAll('#readingWritingSubdomainCheckboxes input[type="checkbox"]')
                );
                const mathSubdomains = getCheckedValues(
                    document.querySelectorAll('#mathSubdomainCheckboxes input[type="checkbox"]')
                );
                
                selectedValues.subdomains = [...readingWritingSubdomains, ...mathSubdomains];
            });
        });

    // Handle search button click
    elements.searchButton.addEventListener('click', async function() {
        if (!selectedValues.test) {
            alert("Please select a test type");
            return;
        }

        if (selectedValues.difficulties.length === 0) {
            alert("Please select at least one difficulty level");
            return;
        }

        if (selectedValues.subdomains.length === 0) {
            alert("Please select at least one subdomain");
            return;
        }

        const requestData = {
            test: selectedValues.test,
            difficulty: selectedValues.difficulties,
            subdomain: selectedValues.subdomains
        };

        try {
            const response = await fetch('/sat/find-questions-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const questions = await response.json();
            
            // Store questions globally for navigation
            window.currentQuestions = questions;
            window.currentQuestionIndex = 0;

            // Render the first question if there are any questions
            if (questions.length > 0) {
                renderQuestion(questions[0]);
                
                const questionHeaderElement = document.getElementById("questionHeader");
                if (questionHeaderElement) {
                    questionHeaderElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                const questionText = document.getElementById('questionText');
                questionText.textContent = 'No questions found matching your criteria.';
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            const questionText = document.getElementById('questionText');
            questionText.textContent = 'Error loading questions. Please try again.';
        }
    });

    // Function to render a question
    function renderQuestion(question) {
        const elements = {
            questionText: document.getElementById('questionText'),
            questionDetails: document.getElementById('questionDetails'),
            answerContainer: document.querySelector('.answer_container'),
            feedback: document.getElementById('feedback'),
            rationale: document.getElementById('rationale'),
            questionNumber: document.getElementById('questionNumber'),
            metadata: {
                difficulty: document.getElementById('questionDifficulty'),
                category: document.getElementById('questionCategory'),
                domain: document.getElementById('questionDomain'),
                skill: document.getElementById('questionSkill')
            }
        };
        
        // Clear existing content
        elements.questionText.textContent = question.question;
        elements.questionDetails.textContent = question.details || '';
        elements.answerContainer.innerHTML = '';
        elements.feedback.style.display = 'none';
        
        // Update metadata
        elements.metadata.difficulty.textContent = `Difficulty: ${question.difficulty}`;
        elements.metadata.category.textContent = `Category: ${question.category}`;
        elements.metadata.domain.textContent = `Domain: ${question.domain}`;
        elements.metadata.skill.textContent = `Skill: ${question.skill}`;
        
        // Update question number
        if (window.currentQuestions) {
            elements.questionNumber.textContent = `Question ${window.currentQuestionIndex + 1} of ${window.currentQuestions.length}`;
        }
        
        // Parse and render answer choices
        try {
            const choices = JSON.parse(question.answerChoices);
            choices.forEach(choice => {
                const optionButton = document.createElement('button');
                optionButton.className = 'option-button';
                optionButton.textContent = choice.content;
                optionButton.dataset.id = choice.id;
                
                optionButton.addEventListener('click', () => {
                    document.querySelectorAll('.option-button').forEach(btn => {
                        btn.classList.remove('selected', 'correct', 'incorrect');
                    });
                    
                    optionButton.classList.add('selected');
                    
                    // Show feedback
                    elements.feedback.style.display = 'block';
                    const correctness = document.getElementById('correctness');
                    if (choice.id === question.answer) {
                        correctness.textContent = 'Correct!';
                        optionButton.classList.add('correct');
                    } else {
                        correctness.textContent = 'Incorrect';
                        optionButton.classList.add('incorrect');
                    }
                    
                    // Show rationale
                    elements.rationale.textContent = question.rationale;
                });
                
                elements.answerContainer.appendChild(optionButton);
            });
        } catch (e) {
            console.error('Error parsing answer choices:', e);
            elements.answerContainer.innerHTML = '<p>Error loading answer choices</p>';
        }
        
        // Update navigation buttons
        elements.prevQuestionBtn.disabled = !window.currentQuestions || window.currentQuestionIndex === 0;
        elements.nextQuestionBtn.disabled = !window.currentQuestions || window.currentQuestionIndex === window.currentQuestions.length - 1;
    }

    // Navigation button handlers
    elements.prevQuestionBtn?.addEventListener('click', () => {
        if (window.currentQuestions && window.currentQuestionIndex > 0) {
            window.currentQuestionIndex--;
            renderQuestion(window.currentQuestions[window.currentQuestionIndex]);
        }
    });

    elements.nextQuestionBtn?.addEventListener('click', () => {
        if (window.currentQuestions && window.currentQuestionIndex < window.currentQuestions.length - 1) {
            window.currentQuestionIndex++;
            renderQuestion(window.currentQuestions[window.currentQuestionIndex]);
        }
    });
});

//js for feedback popup
const openPopupBtn = document.getElementById('openPopupBtn');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupModal = document.getElementById('popupModal');

openPopupBtn.addEventListener('click', () => {
  popupModal.style.display = 'flex'; 
});

closePopupBtn.addEventListener('click', () => {
  popupModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === popupModal) {
    popupModal.style.display = 'none';
  }
});