console.log("Script loaded");


// Add smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Rotating headlines functionality
const headlines = [
    {
        main: 'better SAT ',
        highlight: '2 clicks ',
        end:'away.'

    },
    {
        main: 'find your dream ',
        highlight: 'summer program',
        end:'.'
    },
    {
        main: 'get your',
        highlight: 'internships ',
        end: 'weekly,\nfor free.'
    },

];

let currentIndex = 0;
const container = document.querySelector('.headline-container');
const mainText = document.querySelector('.headline-text');
const highlightText = document.querySelector('.highlight-text');
const endText = document.querySelector('.end-text');

function updateText() {
    const current = headlines[currentIndex];
    mainText.textContent = current.main;
    highlightText.textContent = current.highlight;
    // Replace \n with <br> for line break
    if (current.end) {
        endText.innerHTML = current.end.replace('\n', '<br>');
    } else {
        endText.innerHTML = '';
    }
}

function rotateHeadlines() {
    // Add fade out class
    container.classList.add('fade');
    
    // After fade out, update text and fade in
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % headlines.length;
        updateText();
        container.classList.remove('fade');
    }, 500);
}

// Start the rotation
setInterval(rotateHeadlines, 4000);

// Add this to your script.js file
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation buttons
    const startLearningBtn = document.querySelector('.cta-button');
    const getStartedBtn = document.querySelector('.submit-button');

    // Add click event listeners
    const navigateToSAT = (e) => {
        e.preventDefault();
        window.location.href = '/sat';
    };

    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', navigateToSAT);
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', navigateToSAT);
    }
});

// Add this to your landing page's JavaScript file (script.js)
// Mobile drawer functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const body = document.body;

    // Function to update drawer height based on nav height
    function updateDrawerHeight() {
        const navHeight = document.querySelector('nav').offsetHeight;
        mobileDrawer.style.top = `${navHeight}px`;
        mobileDrawer.style.height = `calc(100vh - ${navHeight}px)`;
    }

    // Initial setup
    updateDrawerHeight();

    // Toggle menu
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
    });

    // Close drawer when clicking a link
    mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileDrawer.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !mobileDrawer.contains(e.target)) {
            menuToggle.classList.remove('active');
            mobileDrawer.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // Update drawer height on resize
    window.addEventListener('resize', () => {
        updateDrawerHeight();
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            mobileDrawer.classList.remove('active');
            body.style.overflow = '';
        }
    });
});