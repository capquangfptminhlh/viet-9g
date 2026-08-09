import { google } from 'googleapis';
import { getBloggerAuth } from '../packages/connectors/blogger/blogger.auth';

export function describeBloggerAuthFailure(error: unknown): string {
  const candidate = error as { response?: { data?: { error?: unknown } }; message?: unknown } | null;
  const responseCode = candidate?.response?.data?.error;
  const rawMessage = error instanceof Error
    ? error.message
    : typeof candidate?.message === 'string'
      ? candidate.message
      : String(error);

  if (responseCode === 'invalid_grant' || /invalid_grant/i.test(rawMessage)) {
    return 'BLOGGER_AUTH_REFRESH_REQUIRED: Google rejected the refresh token (invalid_grant). Reauthorize Blogger OAuth, store the new BLOGGER_REFRESH_TOKEN secret, and keep the OAuth app in production for long-running scheduled access.';
  }

  return `BLOGGER_AUTH_PREFLIGHT_FAILED: ${rawMessage}`;
}

export async function validateBloggerOAuth(): Promise<void> {
  const { clientId, clientSecret, refreshToken } = getBloggerAuth();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const accessToken = await oauth2Client.getAccessToken();
  if (!accessToken?.token) {
    throw new Error('access token was not returned');
  }
}

const isMain = process.argv[1]
  && (process.argv[1].endsWith('blogger-auth-preflight.ts') || process.argv[1].endsWith('blogger-auth-preflight.js'));

if (isMain) {
  validateBloggerOAuth()
    .then(() => console.log('BLOGGER_AUTH_PREFLIGHT_PASS'))
    .catch((error) => {
      console.error(describeBloggerAuthFailure(error));
      process.exit(1);
    });
}
