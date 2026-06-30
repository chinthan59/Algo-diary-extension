import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function main() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  
  if (!owner || !repo) {
    console.error('Missing GITHUB_OWNER or GITHUB_REPO');
    return;
  }

  const pathInRepo = 'leetcode/Unknown/two-sum.md';

  try {
    console.log(`Looking for ${pathInRepo} in ${owner}/${repo}...`);
    // 1. Get the file's SHA
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: pathInRepo
    });

    if (!Array.isArray(response.data) && response.data.type === 'file') {
      const sha = response.data.sha;
      console.log(`Found file with SHA: ${sha}. Deleting from GitHub...`);
      
      // 2. Delete from GitHub
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: pathInRepo,
        message: 'chore: remove bad two-sum file',
        sha,
        branch: 'main'
      });
      console.log('Successfully deleted from GitHub!');
    }
  } catch (err: any) {
    if (err.status === 404) {
      console.log('File not found on GitHub, it might have been already deleted.');
    } else {
      console.error('Error interacting with GitHub:', err.message);
    }
  }

  // 3. Remove from local db.json
  const dbPath = path.resolve(__dirname, '../data/db.json');
  if (fs.existsSync(dbPath)) {
    const dbStr = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbStr);
    
    const initialLength = db.solutions.length;
    db.solutions = db.solutions.filter((s: any) => s.title !== 'Two Sum');
    
    if (db.solutions.length < initialLength) {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log('Successfully removed "Two Sum" from local database!');
    } else {
      console.log('"Two Sum" was not found in the local database.');
    }
  }
}

main().catch(console.error);
