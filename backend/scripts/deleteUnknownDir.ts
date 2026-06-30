import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

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

  const dirPath = 'leetcode/Unknown';

  try {
    console.log(`Looking for files in ${dirPath}...`);
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: dirPath
    });

    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} files in ${dirPath}. Deleting them...`);
      for (const file of response.data) {
        if (file.type === 'file') {
          console.log(`Deleting ${file.path}...`);
          await octokit.repos.deleteFile({
            owner,
            repo,
            path: file.path,
            message: `chore: remove old file ${file.name}`,
            sha: file.sha,
            branch: 'main'
          });
        }
      }
      console.log(`Finished deleting files in ${dirPath}!`);
    }
  } catch (err: any) {
    if (err.status === 404) {
      console.log(`${dirPath} not found. It might already be empty/deleted.`);
    } else {
      console.error('Error interacting with GitHub:', err.message);
    }
  }
}

main().catch(console.error);
