/**
 * Portfolio Website - Vanilla JavaScript
 * Zero dependencies, fully standalone
 */

// ================================
// 1. INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initTabNavigation();
});

// ================================
// 2. SCROLL-TRIGGERED ANIMATIONS
// ================================

/**
 * Initialize Intersection Observer for scroll-triggered animations
 */
function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Show all elements immediately without animations
        showAllElements();
        return;
    }

    // Profile Image Animation
    animateProfileImage();

    // Social Links Animation (staggered)
    animateSocialLinks();

    // Heading Word Animations (staggered)
    animateHeadingWords();

    // Tabs Section Animation
    animateTabsSection();

    // Venture Cards Animation
    animateVentureCards();

    // Tech Stack Cards Animation
    animateTechCards();
}

/**
 * Show all elements without animation (for reduced motion preference)
 */
function showAllElements() {
    const elements = document.querySelectorAll('.profile-image-wrapper, .social-link, .tabs-section, .venture-card, .word');
    elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

/**
 * Animate profile image
 */
function animateProfileImage() {
    const profileImageWrapper = document.querySelector('.profile-image-wrapper');
    if (!profileImageWrapper) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                profileImageWrapper.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(profileImageWrapper);
}

/**
 * Animate social links with staggered delays
 */
function animateSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    if (socialLinks.length === 0) return;

    const delays = [0.7, 0.75]; // Staggered delays in seconds (2 icons: LinkedIn, Instagram)

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                socialLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.classList.add('animated');
                        link.style.animationDelay = `${delays[index]}s`;
                    }, 0);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (socialLinks[0]) {
        observer.observe(socialLinks[0]);
    }
}

/**
 * Animate heading words with staggered delays
 */
function animateHeadingWords() {
    const words = document.querySelectorAll('.word');
    if (words.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const wordsInSection = entry.target.querySelectorAll('.word');
                wordsInSection.forEach((word, index) => {
                    setTimeout(() => {
                        word.classList.add('animated');
                        word.style.animationDelay = `${index * 0.05}s`;
                    }, 0);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe heading containers
    const headings = document.querySelectorAll('.heading-primary, .heading-secondary');
    headings.forEach(heading => observer.observe(heading));
}

/**
 * Animate tabs section (on page load)
 */
function animateTabsSection() {
    const tabsSection = document.querySelector('.tabs-section');
    if (!tabsSection) return;

    // Animate immediately on page load
    tabsSection.classList.add('animated');
}

/**
 * Animate venture cards (after tabs section completes, on page load)
 */
function animateVentureCards() {
    const cards = document.querySelectorAll('.venture-card');
    if (cards.length === 0) return;

    const tabsAnimationDuration = 1100; // 1.1s animation duration from CSS
    const tabsAnimationDelay = 1200; // 1.2s delay from CSS
    const totalTabsAnimationTime = tabsAnimationDuration + tabsAnimationDelay; // 2.3s total
    const cardStaggerDelay = 100; // 100ms delay between each card

    // Animate cards after tabs section completes, on page load with staggered delays
    setTimeout(() => {
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * cardStaggerDelay);
        });
    }, totalTabsAnimationTime);
}

/**
 * Animate tech stack cards (after tabs section completes, on page load)
 */
function animateTechCards() {
    const cards = document.querySelectorAll('.tech-card');
    if (cards.length === 0) return;

    const tabsAnimationDuration = 1100; // 1.1s animation duration from CSS
    const tabsAnimationDelay = 1200; // 1.2s delay from CSS
    const totalTabsAnimationTime = tabsAnimationDuration + tabsAnimationDelay; // 2.3s total
    const cardStaggerDelay = 50; // 50ms delay between each card

    // Animate cards after tabs section completes, on page load with staggered delays
    setTimeout(() => {
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * cardStaggerDelay);
        });
    }, totalTabsAnimationTime);
}

/**
 * Animate tech stack cards on scroll (for when tab is switched)
 */
function animateTechCardsOnScroll() {
    const cards = document.querySelectorAll('.tech-card');
    if (cards.length === 0) return;

    // Remove any existing animated class to reset
    cards.forEach(card => card.classList.remove('animated'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

// ================================
// 3. TAB NAVIGATION
// ================================

/**
 * Initialize tab navigation functionality
 */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-item');
    if (tabButtons.length === 0) return;

    tabButtons.forEach(button => {
        // Click event
        button.addEventListener('click', () => {
            handleTabClick(button, tabButtons);
        });

        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(button, tabButtons);
            }
        });
    });
}

/**
 * Handle tab button click
 */
function handleTabClick(clickedButton, allButtons) {
    // Remove active class from all buttons
    allButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    // Add active class to clicked button
    clickedButton.classList.add('active');
    clickedButton.setAttribute('aria-selected', 'true');

    // Get the tab data attribute
    const tabName = clickedButton.getAttribute('data-tab');

    // Show/hide content sections based on selected tab
    const projectsSection = document.getElementById('projects-section');
    const techSection = document.getElementById('tech-section');

    if (tabName === 'projects') {
        if (projectsSection) {
            projectsSection.style.display = 'flex';
            // Animate project cards immediately with staggered delays when tab is clicked
            const projectCards = document.querySelectorAll('.venture-card');
            const cardStaggerDelay = 100; // 100ms delay between each card
            
            // Remove animated class to reset
            projectCards.forEach(card => card.classList.remove('animated'));
            
            // Animate cards with staggered delays
            setTimeout(() => {
                projectCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animated');
                    }, index * cardStaggerDelay);
                });
            }, 50);
        }
        if (techSection) techSection.style.display = 'none';
    } else if (tabName === 'tech') {
        if (projectsSection) projectsSection.style.display = 'none';
        if (techSection) {
            techSection.style.display = 'flex';
            // Animate tech cards immediately with staggered delays when tab is clicked
            const techCards = document.querySelectorAll('.tech-card');
            const cardStaggerDelay = 50; // 50ms delay between each card
            
            // Remove animated class to reset
            techCards.forEach(card => card.classList.remove('animated'));
            
            // Animate cards with staggered delays
            setTimeout(() => {
                techCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animated');
                    }, index * cardStaggerDelay);
                });
            }, 50);
        }
    }
}

// ================================
// 4. UTILITY FUNCTIONS
// ================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ================================
// 5. ERROR HANDLING
// ================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('An error occurred:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
