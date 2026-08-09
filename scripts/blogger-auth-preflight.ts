import { google } from 'googleapis';
import { getBloggerAuth } from '../packages/connectors/blogger/blogger.auth';

export async function validateBloggerOAuth(): Promise<void> {
  const { clientId, clientSecret, refreshToken } = getBloggerAuth();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const accessToken = await oauth2Client.getAccessToken();
  if (!accessToken?.token) {
    throw new Error('BLOGGER_AUTH_PREFLIGHT_FAILED: access token was not returned');
  }
}

const isMain = process.argv[1]
  && (process.argv[1].endsWith('blogger-auth-preflight.ts') || process.argv[1].endsWith('blogger-auth-preflight.js'));

if (isMain) {
  validateBloggerOAuth()
    .then(() => console.log('BLOGGER_AUTH_PREFLIGHT_PASS'))
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`BLOGGER_AUTH_PREFLIGHT_FAILED: ${message}`);
      process.exit(1);
    });
}
