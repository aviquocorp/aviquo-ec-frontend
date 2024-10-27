document.addEventListener("DOMContentLoaded", function() {
    const assessmentCheckboxes = document.querySelectorAll("#assessmentCheckboxes input[type='checkbox']");
    const testSectionCheckboxes = document.getElementById("testSectionCheckboxes");
    const testSectionCheckboxesInputs = document.querySelectorAll("#testSectionCheckboxes input[type='checkbox']");
    const readingDomainCheckboxes = document.getElementById("readingDomainCheckboxes");
    const readingDomainCheckboxesInputs = document.querySelectorAll("#readingDomainCheckboxes input[type='checkbox']");
    const mathDomainCheckboxes = document.getElementById("mathDomainCheckboxes");
    const mathDomainCheckboxesInputs = document.querySelectorAll("#mathDomainCheckboxes input[type='checkbox']");
    const difficultyCheckboxes = document.getElementById("difficultyCheckboxes");
    const difficultyCheckboxesInputs = document.querySelectorAll("#difficultyCheckboxes input[type='checkbox']");
    const difficultyButton = document.querySelector(".difficulty_button");
    const excludeQuestions = document.getElementById("excludeQuestions");
    const readingWritingSubdomainCheckboxes = document.getElementById('readingWritingSubdomainCheckboxes');
    const mathSubdomainCheckboxes = document.getElementById('mathSubdomainCheckboxes');
    
    // Assuming you have a button with the ID 'searchButton'
    const searchButton = document.getElementById("searchButton");

    // what's selected
    let test = ""
    let section = ""
    let domain = ""
    let difficulty = ""
    let subdomain = ""

    // Initially hide the exclude questions section
    excludeQuestions.style.display = "none";

    // Show or hide test section checkboxes based on assessment checkbox selection
    assessmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            if ([...assessmentCheckboxes].some(cb => cb.checked)) {
                testSectionCheckboxes.style.display = "block";
                testSectionCheckboxes.scrollIntoView({ behavior: 'smooth' }); // Scroll to test section

                // figure out which test is selected
                const selectedAssessment = [...assessmentCheckboxes].find(cb => cb.checked).name;
                if (selectedAssessment === "SAT") {
                    test = "SAT"
                }
            } else {
                testSectionCheckboxes.style.display = "none";
                hideAllDomainOptions(); // Hide all domain options if no assessment checkbox is selected
                hideAllSubdomainOptions(); // Hide all subdomain options
                excludeQuestions.style.display = "none"; // Hide exclude questions
            }
        });
    });

    // Show specific domain options based on selected test section checkbox
    testSectionCheckboxesInputs.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            hideAllDomainOptions(); // Hide all domain options before showing the selected one
            if (checkbox.checked) {
                section = [...testSectionCheckboxesInputs].find(cb => cb.checked).name;
                
                const targetId = checkbox.getAttribute("data-target");
                const targetOptions = document.getElementById(targetId);
                if (targetOptions) {
                    targetOptions.style.display = "block"; // Show the selected domain options
                    targetOptions.scrollIntoView({ behavior: 'smooth' }); // Scroll to the domain options
                }
            }
        });
    });

    function hideAllDomainOptions() {
        readingDomainCheckboxes.style.display = "none";
        mathDomainCheckboxes.style.display = "none";
        difficultyCheckboxes.style.display = "none";
        hideAllSubdomainOptions(); // Hide all subdomain options
        excludeQuestions.style.display = "none"; // Hide exclude questions
    }

    // Show difficulty checkboxes
    document.querySelectorAll('.domain_button').forEach(button => {
        button.addEventListener('click', function() {
            const currentDomainCheckboxes = this.parentNode;
            const difficultyContainer = document.getElementById('difficultyCheckboxes');
            if (currentDomainCheckboxes.style.display === 'block') {
                // figure out current domain

                let selectedDomain = null;

                console.log(test);
                console.log(section);
                if (section == "reading-writing") {
                    selectedDomain = [...readingDomainCheckboxesInputs].find(cb => cb.checked).name;
                } else if (section == "math") {
                    selectedDomain = [...mathDomainCheckboxesInputs].find(cb => cb.checked).name;
                }
                console.log(selectedDomain);

                difficultyContainer.style.display = 'block';
                difficultyContainer.scrollIntoView({ behavior: 'smooth' }); // Scroll to difficulty options
            }
        });
    });

    // Show subdomain checkboxes based on selected difficulty
    difficultyButton.addEventListener('click', function() {
        hideAllSubdomainOptions(); // Hide all subdomain options

        const selectedTestSection = Array.from(testSectionCheckboxesInputs).find(cb => cb.checked);

        // figure out the difficulty selected
        difficulty = Array.from(difficultyCheckboxesInputs).find(cb => cb.checked).name;
        console.log(difficulty);

        if (selectedTestSection) {
            if (selectedTestSection.name === "reading-writing") {
                readingWritingSubdomainCheckboxes.style.display = 'block'; // Show reading/writing subdomains
                readingWritingSubdomainCheckboxes.scrollIntoView({ behavior: 'smooth' }); // Scroll to subdomains

                section = "reading-writing"
            } else if (selectedTestSection.name === "math") {
                mathSubdomainCheckboxes.style.display = 'block'; // Show math subdomains
                mathSubdomainCheckboxes.scrollIntoView({ behavior: 'smooth' }); // Scroll to subdomains

                section = "math"
            }
        }
    });

    function hideAllSubdomainOptions() {
        readingWritingSubdomainCheckboxes.style.display = "none";
        mathSubdomainCheckboxes.style.display = "none";
    }

    
    document.querySelectorAll('.subdomain_button').forEach(button => {
        button.addEventListener('click', function() {
            excludeQuestions.style.display = "block"; // Show exclude questions section
            excludeQuestions.scrollIntoView({ behavior: 'smooth' }); // Scroll to exclude questions
        });
    });

    // Scroll to "questionHeader" element when search button is pressed
    searchButton.addEventListener('click', function() {
        const questionHeaderElement = document.getElementById("questionHeader");
        if (questionHeaderElement) {
            questionHeaderElement.scrollIntoView({ behavior: 'smooth' }); // Scroll to questionHeader
            console.log("Scrolling to questionHeader");
        } else {
            console.log("Element with ID 'questionHeader' not found.");
        }

        // figure out the 
    });
});