document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('linkedin-toggle');
  const authSection = document.getElementById('auth-section');
  const solutionsList = document.getElementById('solutions-list');

  try {
    // Fetch current settings from backend
    const settingsRes = await fetch('http://localhost:3000/settings');
    const settings = await settingsRes.json();

    toggle.checked = settings.autoPostLinkedIn;
    
    if (!settings.hasLinkedInAuth) {
      authSection.style.display = 'block';
    }

    // Fetch recent solutions
    const solutionsRes = await fetch('http://localhost:3000/solutions');
    const solutions = await solutionsRes.json();

    solutionsList.innerHTML = '';
    
    if (solutions.length === 0) {
      solutionsList.innerHTML = '<div class="solution-item">No solutions tracked yet.</div>';
    } else {
      solutions.forEach(sol => {
        const item = document.createElement('div');
        item.className = 'solution-item';
        item.innerHTML = `
          <div class="solution-title">${sol.title}</div>
          <div class="solution-platform">${sol.platform} • ${sol.language}</div>
          ${sol.github_url ? `<a href="${sol.github_url}" target="_blank" style="color: #89dceb; font-size: 11px;">View on GitHub</a>` : ''}
        `;
        solutionsList.appendChild(item);
      });
    }

  } catch (error) {
    console.error('Error fetching data from backend:', error);
    solutionsList.innerHTML = '<div class="solution-item" style="color:#f38ba8;">Backend not running. Please start the server.</div>';
  }

  // Handle toggle change
  toggle.addEventListener('change', async (e) => {
    try {
      await fetch('http://localhost:3000/settings/linkedin-auto-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: e.target.checked })
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert UI toggle if network fails
      e.target.checked = !e.target.checked;
    }
  });
});
