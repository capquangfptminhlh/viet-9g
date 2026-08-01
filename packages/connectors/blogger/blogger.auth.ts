export function getBloggerAuth(): { clientId: string; clientSecret: string; refreshToken: string } {
  const clientId = process.env.BLOGGER_OAUTH_CLIENT_ID;
  const clientSecret = process.env.BLOGGER_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('CONFIG_ERROR: Missing Blogger OAuth environment variables');
  }

  return { clientId, clientSecret, refreshToken };
}
