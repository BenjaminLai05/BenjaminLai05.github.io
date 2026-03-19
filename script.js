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
    initDynamicDownloads();
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

    const delays = [0.7, 0.75, 0.8]; // Staggered delays in seconds (3 icons: GitHub, LinkedIn, Instagram)

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
 * Debounce function for performance optimisation
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
// 6. DYNAMIC DOWNLOADS
// ================================

/**
 * Initialize dynamic download links based on OS
 */
function initDynamicDownloads() {
    const downloadBtn = document.getElementById('nba-project-download');
    if (!downloadBtn) return;

    const userAgent = navigator.userAgent.toLowerCase();

    // Check if user is on Mac
    if (userAgent.includes('mac')) {
        downloadBtn.href = "https://github.com/BenjaminLai05/nba_prediction_algo/releases/download/v1.1/NBA_Elo_CLI_Mac.zip";
        // Note: Text remains unchanged as requested
    }
}

// ================================
// 7. ERROR HANDLING
// ================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('An error occurred:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ================================
// 8. MODALS (WDC & NBA)
// ================================

function openWdcModal() {
    const modal = document.getElementById('wdcModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchSprintWdc(1, modal.querySelector('.sprint-pill'));
}

function openNbaModal() {
    const modal = document.getElementById('nbaModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchSprintNba(1, modal.querySelector('.sprint-pill'));
}

function openMriModal() {
    const modal = document.getElementById('mriModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchSprintMri(1, modal.querySelector('.sprint-pill'));
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOnOutsideClick(event, modalId) {
    const modal = document.getElementById(modalId);
    if (event.target === modal) closeModal(modalId);
}

function switchTab(event, targetTabId, modalId) {
    const modal = document.getElementById(modalId);
    modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.currentTarget.classList.add('active');
    modal.querySelector('#' + targetTabId).classList.add('active');
}

// Handle escape key to close modals
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const wdcModal = document.getElementById('wdcModal');
        const nbaModal = document.getElementById('nbaModal');
        const mriModal = document.getElementById('mriModal');
        if (wdcModal && wdcModal.classList.contains('active')) closeModal('wdcModal');
        if (nbaModal && nbaModal.classList.contains('active')) closeModal('nbaModal');
        if (mriModal && mriModal.classList.contains('active')) closeModal('mriModal');
    }
});

const tagColors = {
    primary: { bg: 'var(--color-primary-bg)', color: 'var(--color-primary)' },
    success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
    muted:   { bg: 'var(--color-light-gray)', color: 'var(--color-text-secondary)' }
};

function renderCard(card, status) {
    const tc = tagColors[card.tagColor] || tagColors.muted;
    return `
        <div class="kanban-card status-${status}">
            <div class="kanban-meta">
                <span>${card.id}</span>
                <span class="kanban-tag" style="background:${tc.bg};color:${tc.color};">${card.tag}</span>
            </div>
            ${card.text}
        </div>`;
}

const wdcSprintData = {
            1: {
                goal: { title: 'Sprint 1 \u2014 Static Pages & Schema Design (Milestone 1)', desc: 'Build all static HTML/CSS/JS page prototypes and plan the relational database schema.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ALM-01', tag: 'Frontend', tagColor: 'primary', text: 'Create landing page with organisation card grid and search functionality.' },
                    { id: 'ALM-02', tag: 'Frontend', tagColor: 'primary', text: 'Build sign-in and sign-up pages with form validation.' },
                    { id: 'ALM-03', tag: 'Frontend', tagColor: 'primary', text: 'Develop edit profile and admin dashboard page shells.' },
                    { id: 'ALM-04', tag: 'Frontend', tagColor: 'primary', text: 'Build Organisation listing and detail pages with CSS grid layout.' },
                    { id: 'ALM-05', tag: 'Database', tagColor: 'success', text: 'Design normalised MySQL schema with ER diagram for all entities.' },
                    { id: 'ALM-06', tag: 'Planning', tagColor: 'primary', text: 'Document design justifications for all page layouts and interactions.' },
                ],
                retro: null
            },
            2: {
                goal: { title: 'Sprint 2 \u2014 Backend & Authentication (Milestone 2a)', desc: 'Set up Express.js server, MySQL integration, session-based auth, and Google OAuth.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ALM-04', tag: 'Frontend', tagColor: 'primary', text: 'Finalize Organisation pages with dynamic data rendering from API.' },
                    { id: 'ALM-05', tag: 'Database', tagColor: 'success', text: 'Deploy MySQL schema with 7 tables, FK constraints, and seed data.' },
                    { id: 'ALM-08', tag: 'Backend', tagColor: 'warning', text: 'Configure Express server with session middleware and route structure.' },
                    { id: 'ALM-09', tag: 'Backend', tagColor: 'warning', text: 'Implement sign-in/sign-up with username/password and Google OAuth.' },
                    { id: 'ALM-10', tag: 'Backend', tagColor: 'warning', text: 'Create RBAC middleware guards for User, Manager, and Admin tiers.' },
                    { id: 'ALM-11', tag: 'Backend', tagColor: 'warning', text: 'Build User routes for joining orgs, RSVP attendance, and profile editing.' },
                    { id: 'ALM-12', tag: 'Full-Stack', tagColor: 'primary', text: 'Wire frontend AJAX calls to Express API endpoints.' },
                    { id: 'ALM-14', tag: 'Backend', tagColor: 'warning', text: 'Implement Manager routes for event/update CRUD with org-level authorization.' },
                ],
                retro: null
            },
            3: {
                goal: { title: 'Sprint 3 \u2014 Features, Email & Polish (Milestone 2b)', desc: 'Complete all CRUD operations, integrate NodeMailer notifications, implement file uploads, and finalize for submission.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ALM-14', tag: 'Backend', tagColor: 'warning', text: 'Complete Manager routes: create/edit/delete events and updates.' },
                    { id: 'ALM-15', tag: 'Backend', tagColor: 'warning', text: 'Build Admin routes: user management, org CRUD, role assignments.' },
                    { id: 'ALM-11', tag: 'Full-Stack', tagColor: 'primary', text: 'Finalize User flows: join/leave orgs, toggle event attendance.' },
                    { id: 'ALM-16', tag: 'Backend', tagColor: 'warning', text: 'Add express-slow-down rate limiting and input validation.' },
                    { id: 'ALM-12', tag: 'Frontend', tagColor: 'primary', text: 'Connect all frontend forms and interactions to backend API.' },
                    { id: 'ALM-19', tag: 'Backend', tagColor: 'warning', text: 'Integrate NodeMailer for automated event/update email notifications.' },
                    { id: 'ALM-20', tag: 'Backend', tagColor: 'warning', text: 'Implement Multer file upload for profile pictures and org images.' },
                    { id: 'ALM-22', tag: 'Testing', tagColor: 'muted', text: 'Final QA walkthrough across all 4 user roles before submission.' },
                ],
                retro: null
            }
        };

function switchSprintWdc(num, el) {
    const data = wdcSprintData[num];
    if (!data) return;

    const modal = document.getElementById('wdcModal');
    modal.querySelectorAll('.sprint-pill').forEach(p => p.classList.remove('active'));
    if(el) el.classList.add('active');

    document.getElementById('sprint-goal-wdc').innerHTML = `
        <h4 style="margin:0 0 6px 0;color:var(--color-primary);">${data.goal.title}</h4>
        <p style="margin:0;font-size:13.5px;color:var(--color-text-secondary);">${data.goal.desc}</p>`;

    const board = document.getElementById('kanban-board-wdc');
    board.innerHTML = `
        <div class="kanban-column">
            <h5>To Do</h5>
            ${data.todo.map(c => renderCard(c, 'todo')).join('')}
        </div>
        <div class="kanban-column">
            <h5>In Progress</h5>
            ${data.progress.map(c => renderCard(c, 'progress')).join('')}
        </div>
        <div class="kanban-column">
            <h5>Done</h5>
            ${data.done.map(c => renderCard(c, 'done')).join('')}
        </div>`;

    board.style.animation = 'none';
    board.offsetHeight;
    board.style.animation = 'fadeInTab 0.4s ease forwards';

    const retro = document.getElementById('sprint-retro-wdc');
    if (data.retro) {
        retro.style.display = 'block';
        retro.innerHTML = `
            <h4>🔄 Sprint ${num} Retrospective</h4>
            <p><strong>What went well:</strong> ${data.retro.well}</p>
            <p style="margin-top:8px;"><strong>What we learned:</strong> ${data.retro.learned}</p>`;
    } else {
        retro.style.display = 'none';
    }
}

const nbaSprintData = {
            1: {
                goal: { title: 'Sprint 1 — Core Algo & Scraping Pipeline', desc: 'Build HTML scrapers to parse Basketball-Reference game logs & implement baseline Elo logic.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ELO-01', tag: 'Data', tagColor: 'primary', text: 'Scrape full season Box Scores' },
                    { id: 'ELO-02', tag: 'Data', tagColor: 'primary', text: 'Extract individual player seeds' },
                    { id: 'ELO-03', tag: 'Algo', tagColor: 'warning', text: 'Implement player minute adjustments' },
                    { id: 'ELO-04', tag: 'Algo', tagColor: 'warning', text: 'Generate historic backtesting outputs' }
                ],
                retro: { well: "Scraping logic proved extremely resistant to rate limiting.", learned: "Playwright is needed for dynamic pages, BS4 alone isn't enough." },
                points: { todo: 0, progress: 0, done: 14 }
            },
            2: {
                goal: { title: 'Sprint 2 — Live Daily Game Predictions', desc: 'Construct the logic that pulls current-day lineups to execute the pre-game probability engine.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ELO-05', tag: 'Data', tagColor: 'primary', text: 'Write fetch_today.py to scrape daily schedules' },
                    { id: 'ELO-06', tag: 'Algo', tagColor: 'warning', text: 'Weight algorithm by tiered minutes availability' },
                    { id: 'ELO-07', tag: 'CLI', tagColor: 'success', text: 'Format ASCII table outputs for readability' },
                    { id: 'ELO-08', tag: 'Script', tagColor: 'success', text: 'Chain incremental daily updates (update_live_elos.py)' }
                ],
                retro: { well: "Daily scripts chain securely without resetting Elo baselines.", learned: "Finding reliable pre-tipoff lineup data is harder than expected." },
                points: { todo: 0, progress: 0, done: 8 }
            },
            3: {
                goal: { title: 'Sprint 3 — Distribution & Packaging', desc: 'Package complex Python dependencies (Pandas, BS4) into a robust, clickable standalone package using PyInstaller.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'ELO-09', tag: 'Dist', tagColor: 'muted', text: 'Develop build_dist.py for Windows EXE' },
                    { id: 'ELO-10', tag: 'Dist', tagColor: 'muted', text: 'Develop build_dist_mac.py with .command runners' },
                    { id: 'ELO-11', tag: 'Doc', tagColor: 'muted', text: 'Write Game Day instruction manual' }
                ],
                retro: { well: "Successfully bundled Playwright browsers seamlessly inside Mac distribution targets.", learned: "PyInstaller requires careful inclusion hints for hidden dynamic imports." },
                points: { todo: 0, progress: 0, done: 8 }
            }
        };

function switchSprintNba(num, el) {
    const data = nbaSprintData[num];
    if (!data) return;

    const modal = document.getElementById('nbaModal');
    modal.querySelectorAll('.sprint-pill').forEach(p => p.classList.remove('active'));
    if(el) el.classList.add('active');

    document.getElementById('sprint-goal-nba').innerHTML = `
        <h4 style="margin:0 0 6px 0;color:var(--color-primary);">${data.goal.title}</h4>
        <p style="margin:0;font-size:13.5px;color:var(--color-text-secondary);">${data.goal.desc}</p>`;

    const board = document.getElementById('kanban-board-nba');
    board.innerHTML = `
        <div class="kanban-column">
            <h5>To Do</h5>
            ${data.todo.map(c => renderCard(c, 'todo')).join('')}
        </div>
        <div class="kanban-column">
            <h5>In Progress</h5>
            ${data.progress.map(c => renderCard(c, 'progress')).join('')}
        </div>
        <div class="kanban-column">
            <h5>Done</h5>
            ${data.done.map(c => renderCard(c, 'done')).join('')}
        </div>`;

    board.style.animation = 'none';
    board.offsetHeight;
    board.style.animation = 'fadeInTab 0.4s ease forwards';

    const retro = document.getElementById('sprint-retro-nba');
    if (data.retro) {
        retro.style.display = 'block';
        retro.innerHTML = `
            <h4>🔄 Sprint ${num} Retrospective</h4>
            <p><strong>What went well:</strong> ${data.retro.well}</p>
            <p style="margin-top:8px;"><strong>What we learned:</strong> ${data.retro.learned}</p>`;
    } else {
        retro.style.display = 'none';
    }
}

const mriSprintData = {
            1: {
                goal: { title: 'Sprint 1 — Machine Learning & Backend API', desc: 'Curate the medical dataset, train the PyTorch CV model, and expose inferences through FastAPI.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'MRI-01', tag: 'Data', tagColor: 'primary', text: 'Label 2,000+ unstructured MRI training images.' },
                    { id: 'MRI-02', tag: 'Model', tagColor: 'warning', text: 'Architect and train YOLO (You Only Look Once) model for tumour detection.' },
                    { id: 'MRI-03', tag: 'Backend', tagColor: 'success', text: 'Configure FastAPI server and CORS middleware.' },
                    { id: 'MRI-04', tag: 'Backend', tagColor: 'success', text: 'Build /compare-scans inference endpoint mapping.' }
                ],
                retro: { well: "FastAPI integration with PyTorch tensors was highly efficient.", learned: "Properly augmenting training data is critical to preventing model overfitting on static brain scans." }
            },
            2: {
                goal: { title: 'Sprint 2 — React Dashboard & Core UI', desc: 'Build the foundational Single Page Application to visualize patients and medical image data.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'MRI-05', tag: 'Frontend', tagColor: 'primary', text: 'Initialize Vite React project with unified CSS styling.' },
                    { id: 'MRI-06', tag: 'Frontend', tagColor: 'primary', text: 'Build Patient Directory and Global Search bar components.' },
                    { id: 'MRI-07', tag: 'Frontend', tagColor: 'primary', text: 'Implement Imaging Studies tab with historic scan viewer.' },
                    { id: 'MRI-08', tag: 'Full-Stack', tagColor: 'warning', text: 'Connect frontend file selection to FastAPI bounding box generator.' }
                ],
                retro: { well: "The component-based approach made the complex medical UI much easier to manage.", learned: "Handling large base64 image strings in React state requires careful performance optimisation." }
            },
            3: {
                goal: { title: 'Sprint 3 — Advanced Clinical Tools & Polish', desc: 'Add advanced metrics, report handling, and role-based interface features.' },
                todo: [],
                progress: [],
                done: [
                    { id: 'MRI-09', tag: 'UI', tagColor: 'primary', text: 'Standardize patient directory UI styling and alignment.' },
                    { id: 'MRI-10', tag: 'Feature', tagColor: 'warning', text: 'Enhance scan comparison with Confidence Delta & Clinical Recommendation.' },
                    { id: 'MRI-11', tag: 'Feature', tagColor: 'warning', text: 'Implement "Edit Report" functionality in the Reports view.' },
                    { id: 'MRI-12', tag: 'Backend', tagColor: 'success', text: 'Implement role-based notification filtering in App.js.' },
                    { id: 'MRI-13', tag: 'Data', tagColor: 'muted', text: 'Generate robust mock patient histories for demonstration.' }
                ],
                retro: { well: "Adding the Confidence Delta metric provided enormous value for the application layer.", learned: "Role-based UI changes require careful context management to prevent rendering flashes." }
            }
        };

function switchSprintMri(num, el) {
    const data = mriSprintData[num];
    if (!data) return;

    const modal = document.getElementById('mriModal');
    modal.querySelectorAll('.sprint-pill').forEach(p => p.classList.remove('active'));
    if(el) el.classList.add('active');

    document.getElementById('sprint-goal-mri').innerHTML = `
        <h4 style="margin:0 0 6px 0;color:var(--color-primary);">${data.goal.title}</h4>
        <p style="margin:0;font-size:13.5px;color:var(--color-text-secondary);">${data.goal.desc}</p>`;

    const board = document.getElementById('kanban-board-mri');
    board.innerHTML = `
        <div class="kanban-column">
            <h5>To Do</h5>
            ${data.todo.map(c => renderCard(c, 'todo')).join('')}
        </div>
        <div class="kanban-column">
            <h5>In Progress</h5>
            ${data.progress.map(c => renderCard(c, 'progress')).join('')}
        </div>
        <div class="kanban-column">
            <h5>Done</h5>
            ${data.done.map(c => renderCard(c, 'done')).join('')}
        </div>`;

    board.style.animation = 'none';
    board.offsetHeight;
    board.style.animation = 'fadeInTab 0.4s ease forwards';

    const retro = document.getElementById('sprint-retro-mri');
    if (data.retro) {
        retro.style.display = 'block';
        retro.innerHTML = `
            <h4>🔄 Sprint ${num} Retrospective</h4>
            <p><strong>What went well:</strong> ${data.retro.well}</p>
            <p style="margin-top:8px;"><strong>What we learned:</strong> ${data.retro.learned}</p>`;
    } else {
        retro.style.display = 'none';
    }
}

// ================================
// 8. IMAGE LIGHTBOX (SDLC Modals)
// ================================

function openImageLightbox(src) {
    const lightbox = document.getElementById('image-lightbox');
    const img = document.getElementById('lightbox-img');
    if (lightbox && img) {
        img.src = src;
        lightbox.classList.add('active');
    }
}

function closeImageLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

// Bind click events to all gallery cards to open the lightbox
document.addEventListener('DOMContentLoaded', () => {
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            if (img) {
                openImageLightbox(img.src);
            }
        });
    });
});
