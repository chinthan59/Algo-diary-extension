import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import solutionRoute from './routes/solution';
import db, { setSetting, getSetting } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/solution', solutionRoute);

// API to toggle LinkedIn auto-posting
app.post('/settings/linkedin-auto-post', (req, res) => {
  const { enabled } = req.body;
  setSetting('auto_post_linkedin', enabled ? 'true' : 'false');
  res.json({ success: true, enabled });
});

app.get('/settings', (req, res) => {
  const enabled = getSetting('auto_post_linkedin', 'false') === 'true';
  const hasToken = !!getSetting('linkedin_access_token');
  res.json({ autoPostLinkedIn: enabled, hasLinkedInAuth: hasToken });
});

app.get('/solutions', (req, res) => {
  const stmt = db.prepare('SELECT * FROM solutions ORDER BY created_at DESC LIMIT 5');
  const solutions = stmt.all();
  res.json(solutions);
});

// LinkedIn OAuth flows
app.get('/auth/linkedin', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI || '');
  const scope = encodeURIComponent('w_member_social profile openid');
  
  if (!clientId || !redirectUri) {
    return res.status(500).send('LinkedIn credentials missing from env');
  }

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(authUrl);
});

app.get('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  try {
    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenRes.data.access_token;
    setSetting('linkedin_access_token', accessToken);
    
    res.send(`
      <html>
        <body>
          <h1>LinkedIn Authentication Successful!</h1>
          <p>You can now close this tab.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('LinkedIn auth error:', err.response?.data || err.message);
    res.status(500).send('LinkedIn Authentication Failed');
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
