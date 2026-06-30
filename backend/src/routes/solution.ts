import { Router, Request, Response } from 'express';
import db, { checkSolutionExists, saveSolution, getSetting } from '../db';
import { analyzeSolution } from '../services/groq';
import { generateMarkdown } from '../utils/markdown';
import { pushToGitHub } from '../services/github';
import { postToLinkedIn } from '../services/linkedin';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      platform,
      title,
      url,
      language,
      code,
      runtime,
      memory,
      difficulty
    } = req.body;

    if (!platform || !title || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Check for duplicates
    if (checkSolutionExists(platform, title)) {
      return res.status(200).json({ message: 'Solution already processed. Skipping.' });
    }

    // 2. Call Claude to analyze
    const analysis = await analyzeSolution(req.body);

    // 3. Generate Markdown
    const markdown = generateMarkdown(req.body, analysis);

    // 4. Push to GitHub
    const githubUrl = await pushToGitHub(platform, difficulty, title, markdown);

    // 5. LinkedIn Post (if enabled)
    let linkedinPosted = 0;
    const autoPostLinkedIn = getSetting('auto_post_linkedin', 'false') === 'true';
    
    if (autoPostLinkedIn && analysis.linkedin_caption) {
      try {
        await postToLinkedIn(analysis.linkedin_caption, githubUrl);
        linkedinPosted = 1;
      } catch (err: any) {
        console.error('LinkedIn post failed:', err.message);
        // Continue even if LinkedIn fails
      }
    }

    // 6. Save to DB
    const slug = title.toLowerCase().replace(/[0-9]/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
    saveSolution({
      platform,
      title,
      slug,
      language,
      github_url: githubUrl,
      linkedin_posted: linkedinPosted
    });

    res.status(200).json({
      message: 'Successfully processed solution',
      githubUrl,
      linkedinPosted: linkedinPosted === 1
    });
  } catch (error: any) {
    console.error('Error processing solution:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
