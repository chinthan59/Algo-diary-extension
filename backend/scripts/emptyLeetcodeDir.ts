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

  const dirPath = 'leetcode';

  try {
    console.log(`Looking for files in ${dirPath}...`);
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: dirPath
    });

    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} items in ${dirPath}. Deleting files...`);
      for (const item of response.data) {
        if (item.type === 'file') {
          console.log(`Deleting ${item.path}...`);
          await octokit.repos.deleteFile({
            owner,
            repo,
            path: item.path,
            message: `chore: empty directory ${item.name}`,
            sha: item.sha,
            branch: 'main'
          });
        } else if (item.type === 'dir' && item.name === 'Unknown') {
            // Also recursively delete Unknown if it exists somehow
            console.log('Skipping Unknown directory, we only delete files in leetcode/');
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
