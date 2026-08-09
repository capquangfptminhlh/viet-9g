import crypto from 'node:crypto';
import readline from 'node:readline';
import { google } from 'googleapis';

const clientId = process.env.BLOGGER_OAUTH_CLIENT_ID;
const clientSecret = process.env.BLOGGER_OAUTH_CLIENT_SECRET;
const redirectUri = process.env.BLOGGER_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';
const scope = 'https://www.googleapis.com/auth/blogger';

if (!clientId || !clientSecret) {
  console.error('CONFIG_ERROR: Missing BLOGGER_OAUTH_CLIENT_ID or BLOGGER_OAUTH_CLIENT_SECRET.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const state = crypto.randomBytes(24).toString('hex');
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  include_granted_scopes: true,
  scope: [scope],
  state,
});

console.log('--- BLOGGER OAUTH REAUTHORIZATION ---');
console.log('1. In Google Cloud OAuth, use Publishing status = In production for long-running automation.');
console.log('2. Open this URL in the Google account that has Blogger author/admin access:');
console.log(authUrl);
console.log(`3. After consent, copy the full callback URL (${redirectUri}?code=...&state=...) and paste it below.`);
console.log('4. Store the returned refresh token only in the GitHub Actions secret BLOGGER_REFRESH_TOKEN. Never commit it.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nPaste callback URL (preferred) or authorization code: ', async (input) => {
  rl.close();
  try {
    const value = input.trim();
    let code = value;

    if (/^https?:\/\//i.test(value)) {
      const callback = new URL(value);
      const returnedState = callback.searchParams.get('state');
      if (returnedState !== state) {
        throw new Error('OAUTH_STATE_MISMATCH: callback state did not match this authorization session');
      }
      code = callback.searchParams.get('code') || '';
    } else {
      console.warn('WARNING: authorization code pasted without callback URL; OAuth state could not be verified.');
    }

    if (!code) throw new Error('AUTHORIZATION_CODE_MISSING');

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('REFRESH_TOKEN_MISSING: Google did not return a refresh token. Re-run with prompt=consent and offline access.');
    }

    console.log('\nOAuth exchange succeeded. Update the GitHub Actions secret with:');
    console.log(`BLOGGER_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nThen run the Blogger Owned Media Publish workflow once manually to verify production access.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`OAUTH_SETUP_FAILED: ${message}`);
    process.exitCode = 1;
  }
});
