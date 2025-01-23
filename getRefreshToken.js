const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  '1024909426053-opkm7qnceucqsmf6oeo5mgpe9psvpbfe.apps.googleusercontent.com',
  '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',
  'http://localhost:5001'
);

const getToken = async () => {
  const code = '4/0AanRRrsgJpgAtracvpCRVCW3vxdCrUEICGOBqEyX0t9LZPsvdbBLvh9O515lyfoIIzxt5g'; // Replace this with the code from the URL
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Tokens:', tokens); // Includes expiry details
  } catch (err) {
    console.error('Error exchanging code for token:', err);
  }
};

getToken();