import axios from 'axios';
import { getSetting } from '../db';
import dotenv from 'dotenv';

dotenv.config();

export async function postToLinkedIn(caption: string, url: string): Promise<void> {
  const accessToken = getSetting('linkedin_access_token');
  if (!accessToken) {
    throw new Error('LinkedIn access token not found');
  }

  // First we need the user's URN
  const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const personUrn = `urn:li:person:${profileRes.data.sub}`;

  // Post to UGC API
  await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: caption
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              description: {
                text: 'View my code solution on GitHub'
              },
              originalUrl: url,
              title: {
                text: 'Code Solution'
              }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    }
  );
}
