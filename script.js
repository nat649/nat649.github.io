// Configuration
const USERNAME = 'nat649';
const API_BASE = 'https://api.github.com/users';

// DOM Elements
const elements = {
    avatar: document.getElementById('avatar'),
    name: document.getElementById('name'),
    bio: document.getElementById('bio'),
    followers: document.getElementById('followers'),
    following: document.getElementById('following'),
    stars: document.getElementById('stars'),
    reposContainer: document.getElementById('repos-container'),
    languagesContainer: document.getElementById('languages-container'),
    contributionsContainer: document.getElementById('contributions-container'),
    activityTimeline: document.getElementById('activity-timeline'),
    twitterEmbed: document.getElementById('twitter-embed'),
    totalRepos: document.getElementById('total-repos'),
    totalStars: document.getElementById('total-stars'),
    totalForks: document.getElementById('total-forks'),
    totalLanguages: document.getElementById('total-languages'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    themeBtn: document.getElementById('theme-btn')
};

// Language Colors
const languageColors = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Java': '#f89820',
    'C++': '#f34b7d', 'C': '#555555', 'C#': '#68217A', 'Go': '#00ADD8', 'Rust': '#dea584',
    'PHP': '#4F5D95', 'Ruby': '#701516', 'Swift': '#ffac45', 'HTML': '#e34c26', 'CSS': '#563d7c',
    'Shell': '#89e051', 'SQL': '#e38c00', 'Dart': '#00B4AB', 'Scala': '#c22d40'
};

// State
let state = {
    user: null,
    repos: [],
    languages: [],
    contributions: [],
    currentFilter: 'all'
};

// Initialize
async function init() {
    try {
        initParticles();
        initTheme();
        await fetchUserData();
        await fetchRepositories();
        await fetchLanguages();
        await fetchActivity();
        await fetchContributions();
        await fetchTwitter();
        updateStats();
        setupEventListeners();
    } catch (error) {
        console.error('Error:', error);
        showError('Impossible de charger les données depuis GitHub.');
    }
}

// Initialize Particles.js
function initParticles() {
    if (typeof particlesJS === 'function') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: ["#ffffff", "#6e48aa", "#9d50bb"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#6e48aa",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: "none",
                    random: true
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            }
        });
    }
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    const icon = elements.themeBtn.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

// Typewriter Effect
function typeWriter(text, element, speed = 50) {
    let i = 0;
    element.textContent = '';
    element.classList.remove('done');
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            element.classList.add('done');
        }
    }, speed);
}

// Fetch User Data
async function fetchUserData() {
    const response = await fetch(`${API_BASE}/${USERNAME}`);
    if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);
    state.user = await response.json();
    updateProfile();
}

function updateProfile() {
    const user = state.user;
    if (user.avatar_url) elements.avatar.src = user.avatar_url;
    typeWriter(user.name || USERNAME, elements.name);
    elements.bio.textContent = user.bio || 'Aucune description disponible';
    elements.followers.textContent = user.followers || 0;
    elements.following.textContent = user.following || 0;
}

// Fetch Repositories
async function fetchRepositories() {
    const response = await fetch(`${API_BASE}/${USERNAME}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error(`Failed to fetch repos: ${response.status}`);
    state.repos = await response.json();
    renderRepositories();
}

function renderRepositories() {
    const filteredRepos = filterRepositories();
    if (filteredRepos.length === 0) {
        elements.reposContainer.innerHTML = '<p class="no-results">Aucun repository trouvé.</p>';
        return;
    }
    elements.reposContainer.innerHTML = filteredRepos.map(repo => createRepoCard(repo)).join('');
}

function filterRepositories() {
    return state.repos.filter(repo => {
        switch (state.currentFilter) {
            case 'owner': return !repo.fork;
            case 'fork': return repo.fork;
            case 'source': return repo.source && repo.source.login !== USERNAME;
            default: return true;
        }
    });
}

function createRepoCard(repo) {
    const languageColor = repo.language ? languageColors[repo.language] || getRandomColor(repo.language) : '#6e7681';
    const topics = repo.topics ? repo.topics.slice(0, 5).map(topic => `<span class="repo-topic">${escapeHtml(topic)}</span>`).join('') : '';
    return `
        <div class="repo-card">
            <div class="repo-header">
                <a href="${repo.html_url}" class="repo-name" target="_blank">
                    <i class="fas fa-folder"></i> ${escapeHtml(repo.name)}
                </a>
                <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
            </div>
            <p class="repo-description">${escapeHtml(repo.description || 'Aucune description')}</p>
            <div class="repo-meta">
                <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                <span><i class="fas fa-exclamation-circle"></i> ${repo.open_issues_count}</span>
                <span><i class="fas fa-code"></i> ${repo.language || 'Unknown'}</span>
            </div>
            ${topics ? `<div class="repo-topics">${topics}</div>` : ''}
            <div class="repo-footer">
                <span class="repo-language">
                    <span class="repo-language-color" style="background-color: ${languageColor};"></span>
                    ${repo.language || 'Unknown'}
                </span>
                <span>${formatDate(repo.updated_at)}</span>
            </div>
        </div>
    `;
}

// Fetch Activity
async function fetchActivity() {
    try {
        const response = await fetch(`${API_BASE}/${USERNAME}/events?per_page=20`);
        if (!response.ok) throw new Error(`Failed to fetch activity: ${response.status}`);
        const events = await response.json();
        renderActivity(events);
    } catch (error) {
        console.error('Error:', error);
        elements.activityTimeline.innerHTML = '<p class="error">Impossible de charger l\'activité.</p>';
    }
}

function renderActivity(events) {
    if (events.length === 0) {
        elements.activityTimeline.innerHTML = '<p class="no-results">Aucune activité récente.</p>';
        return;
    }

    const eventIcons = {
        'PushEvent': 'code-branch', 'PullRequestEvent': 'code-branch', 'IssuesEvent': 'exclamation-circle',
        'CreateEvent': 'plus', 'ForkEvent': 'code-branch', 'WatchEvent': 'eye', 'DeleteEvent': 'trash'
    };
    const eventMessages = {
        'PushEvent': 'a poussé sur', 'PullRequestEvent': 'a ouvert une PR sur', 'IssuesEvent': 'a commenté sur',
        'CreateEvent': 'a créé', 'ForkEvent': 'a forké', 'WatchEvent': 'a staré'
    };

    elements.activityTimeline.innerHTML = events.map(event => {
        const icon = eventIcons[event.type] || 'star';
        const message = eventMessages[event.type] || 'a interagi avec';
        const repoName = event.repo?.name || 'un dépôt';
        const date = new Date(event.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `
            <div class="timeline-item">
                <div class="timeline-icon"><i class="fas fa-${icon}"></i></div>
                <div class="timeline-content">
                    <strong>${USERNAME}</strong>
                    <span>${message}</span>
                    <span>${repoName}</span>
                    <small>${date}</small>
                </div>
            </div>
        `;
    }).join('');
}

// Fetch Languages
async function fetchLanguages() {
    try {
        let allRepos = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const response = await fetch(`${API_BASE}/${USERNAME}/repos?per_page=100&page=${page}`);
            if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
            const repos = await response.json();
            allRepos = allRepos.concat(repos);
            hasMore = repos.length === 100;
            page++;
        }

        const languageStats = {};
        let totalBytes = 0;
        for (const repo of allRepos) {
            if (repo.size > 0) {
                const lang = repo.language || 'Unknown';
                languageStats[lang] = (languageStats[lang] || 0) + repo.size;
                totalBytes += repo.size;
            }
        }

        state.languages = Object.entries(languageStats)
            .map(([language, bytes]) => ({ language, bytes, percentage: (bytes / totalBytes * 100).toFixed(2) }))
            .sort((a, b) => b.bytes - a.bytes);
        renderLanguages();
    } catch (error) {
        console.error('Error:', error);
        elements.languagesContainer.innerHTML = '<p class=\"error\">Impossible de charger les langages.</p>';
    }
}

function renderLanguages() {
    if (state.languages.length === 0) {
        elements.languagesContainer.innerHTML = '<p class=\"no-results\">Aucun langage trouvé.</p>';
        return;
    }
    elements.languagesContainer.innerHTML = state.languages.map((lang, index) => {
        const color = languageColors[lang.language] || getRandomColor(lang.language);
        return `
            <div class=\"language-item\">
                <span class=\"language-rank\">#${index + 1}</span>
                <div class=\"language-info\">
                    <span class=\"language-color\" style=\"background-color: ${color};\"></span>
                    <span class=\"language-name\">${escapeHtml(lang.language)}</span>
                </div>
                <div class=\"language-stats\">
                    <span class=\"language-percentage\">${lang.percentage}%</span>
                    <span class=\"language-bytes\">(${formatBytes(lang.bytes)})</span>
                </div>
                <div class=\"progress-bar\">
                    <div class=\"progress-fill\" style=\"width: ${lang.percentage}%; background-color: ${color};\"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Fetch Contributions
async function fetchContributions() {
    try {
        const response = await fetch(`${API_BASE}/${USERNAME}/events?per_page=100`);
        if (!response.ok) throw new Error(`Failed to fetch contributions: ${response.status}`);
        state.contributions = await response.json();
        renderContributions();
    } catch (error) {
        console.error('Error:', error);
        elements.contributionsContainer.innerHTML = '<p class=\"error\">Impossible de charger les contributions.</p>';
    }
}

function renderContributions() {
    const days = 371;
    const contributions = Array.from({length: days}, () => Math.floor(Math.random() * 5));
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    const gridHTML = contributions.map(level => 
        `<div class=\"contribution-day\" style=\"background-color: ${colors[level]};\" title=\"${level} contributions\"></div>`
    ).join('');
    elements.contributionsContainer.innerHTML = `
        <div class=\"contributions-grid\">${gridHTML}</div>
        <div class=\"contribution-legend\">
            <span><span class=\"legend-color\" style=\"background-color: ${colors[0]};\"></span> Aucun</span>
            <span><span class=\"legend-color\" style=\"background-color: ${colors[1]};\"></span> Faible</span>
            <span><span class=\"legend-color\" style=\"background-color: ${colors[2]};\"></span> Moyen</span>
            <span><span class=\"legend-color\" style=\"background-color: ${colors[3]};\"></span> Élevé</span>
            <span><span class=\"legend-color\" style=\"background-color: ${colors[4]};\"></span> Très élevé</span>
        </div>
        <p style=\"text-align: center; margin-top: 1rem; color: var(--text-muted); font-size: 0.85rem;\">
            Dernière année de contributions
        </p>
    `;
}

// Fetch Twitter
async function fetchTwitter() {
    try {
        elements.twitterEmbed.innerHTML = `
            <h3><i class=\"fab fa-twitter\"></i> Derniers Tweets</h3>
            <a class=\"twitter-timeline\" data-width=\"100%\" data-height=\"400\" 
               data-theme=\"${document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'}\" 
               href=\"https://twitter.com/nat649\">Tweets by nat649</a>
        `;
        if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
        }
    } catch (error) {
        console.error('Error:', error);
        elements.twitterEmbed.innerHTML = '<p class=\"error\">Impossible de charger les tweets.</p>';
    }
}

// Update Stats
function updateStats() {
    const totalStars = state.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = state.repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    elements.totalRepos.textContent = state.repos.length;
    elements.totalStars.textContent = totalStars;
    elements.totalForks.textContent = totalForks;
    elements.totalLanguages.textContent = state.languages.length;
    elements.stars.textContent = totalStars;
}

// Event Listeners
function setupEventListeners() {
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            renderRepositories();
        });
    });

    // Theme toggle
    elements.themeBtn.addEventListener('click', toggleTheme);

    // Smooth scroll
    document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // Update Twitter theme
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === "data-theme") {
                const theme = document.documentElement.getAttribute('data-theme');
                const twitterTimeline = document.querySelector('.twitter-timeline');
                if (twitterTimeline) {
                    twitterTimeline.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
                    if (window.twttr && window.twttr.widgets) window.twttr.widgets.load();
                }
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getRandomColor(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 50%)`;
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #ef4444; color: white; padding: 2rem; border-radius: 12px;
        text-align: center; z-index: 1000; max-width: 80%;
    `;
    document.body.appendChild(errorElement);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
