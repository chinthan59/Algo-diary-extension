# Auto-Document & Publish Coding Solutions

A full-stack system that automatically detects when you solve a coding problem on LeetCode, GeeksForGeeks, or HackerRank, analyzes your solution using the Groq API, generates clean markdown documentation, pushes it to a GitHub repo, and optionally posts a summary to LinkedIn.

## Architecture
- **Browser Extension**: Manifest V3 extension injected into supported platforms to scrape solution data.
- **Backend API**: Node.js + Express application built with TypeScript, handling API integrations (Groq, GitHub Octokit, LinkedIn OAuth) and storing local state in SQLite.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your API keys:
   - `GROQ_API_KEY`: Your Groq API key
   - `GITHUB_TOKEN`: A GitHub Personal Access Token (classic) with `repo` scope
   - `GITHUB_OWNER`: Your GitHub username
   - `GITHUB_REPO`: The target repository name (e.g., `solutions`)
   - `LINKEDIN_CLIENT_ID` & `LINKEDIN_CLIENT_SECRET`: From your LinkedIn developer application
4. Start the backend: `npm run dev` (starts on http://localhost:3000)

### 2. Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right.
3. Click "Load unpacked" and select the `extension` folder in this project.
4. Click the extension icon to view the popup and configure LinkedIn auto-posting.

### 3. LinkedIn OAuth Setup (First Time)
If you want to use the LinkedIn posting feature, you need to authorize the app once.
Visit `http://localhost:3000/auth/linkedin` in your browser while the backend is running.

## Supported Platforms
- **LeetCode**: Detects successful submissions by observing the DOM for success states.
- **GeeksForGeeks**: Detects successful submissions by watching for the "Correct Answer" modal.
- **HackerRank**: Detects successful submissions by watching for the congratulations element.

## GitHub Repository Structure
Generated markdown files will be organized in your target repository as follows:
`{platform}/{difficulty}/{problem-slug}.md`
