import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function pushToGitHub(
  platform: string,
  difficulty: string = 'Unknown',
  title: string,
  content: string
): Promise<string> {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!owner || !repo) {
    throw new Error('GitHub configuration missing (owner or repo)');
  }

  const slug = title.toLowerCase().replace(/[0-9]/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  const path = `${platform}/${slug}.md`;

  let sha: string | undefined;

  try {
    // Check if file exists to get its SHA for updating
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (!Array.isArray(response.data) && response.data.type === 'file') {
      sha = response.data.sha;
    }
  } catch (error: any) {
    // 404 is fine, means file doesn't exist yet
    if (error.status !== 404) {
      throw error;
    }
  }

  const message = `feat: add ${title} [${platform}]`;

  const response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: 'main'
  });

  return response.data.content?.html_url || '';
}
