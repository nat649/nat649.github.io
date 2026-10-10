const USERNAME = 'nat649';

const languageColors = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Java': '#f89820',
    'C++': '#f34b7d', 'C': '#555555', 'C#': '#68217A', 'Go': '#00ADD8', 'Rust': '#dea584',
    'PHP': '#4F5D95', 'Ruby': '#701516', 'Swift': '#ffac45', 'HTML': '#e34c26', 'CSS': '#563d7c'
};

async function init() {
    await Promise.all([fetchUserData(), fetchRepositories(), fetchLanguages()]);
    updateStats();
}

async function fetchUserData() {
    const res = await fetch(`https://api.github.com/users/${USERNAME}`);
    const user = await res.json();
    document.getElementById('name').textContent = user.name || USERNAME;
    document.getElementById('bio').textContent = user.bio || 'Aucune description';
    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
}

async function fetchRepositories() {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
    const repos = await res.json();
    const container = document.getElementById('repos-container');
    container.innerHTML = repos.map(repo => `
        <div class="repo-card">
            <a href="${repo.html_url}" class="repo-name" target="_blank">
                <i class="fas fa-folder"></i> ${repo.name}
            </a>
            <p class="repo-description">${repo.description || 'Aucune description'}</p>
            <div class="repo-meta">
                <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                <span><i class="fas fa-code"></i> ${repo.language || 'Unknown'}</span>
            </div>
        </div>
    `).join('');
}

async function fetchLanguages() {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
    const repos = await res.json();
    const langStats = {};
    repos.forEach(repo => {
        const lang = repo.language || 'Unknown';
        langStats[lang] = (langStats[lang] || 0) + repo.size;
    });
    const languages = Object.entries(langStats)
        .map(([lang, bytes]) => ({ lang, bytes }))
        .sort((a, b) => b.bytes - a.bytes);
    
    const container = document.getElementById('languages-container');
    container.innerHTML = languages.map(lang => {
        const color = languageColors[lang.lang] || '#6e7681';
        return `
            <div class="language-item">
                <span style="color:${color}; font-size:1.2rem;">■</span>
                <span>${lang.lang}</span>
                <div class="progress-bar" style="width:100%; height:8px; background:#1e293b; border-radius:4px; margin-top:0.5rem;">
                    <div style="width:${(lang.bytes / repos.reduce((s,r)=>s+r.size,0))*100}%; height:100%; background:${color}; border-radius:4px;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`)
        .then(res => res.json())
        .then(repos => {
            document.getElementById('total-repos').textContent = repos.length;
            document.getElementById('total-stars').textContent = repos.reduce((s,r) => s + r.stargazers_count, 0);
            document.getElementById('total-forks').textContent = repos.reduce((s,r) => s + r.forks_count, 0);
        });
}

document.addEventListener('DOMContentLoaded', init);
