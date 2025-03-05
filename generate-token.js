const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Generate a custom token for testing
async function generateToken() {
  try {
    // Replace 'test-user-123' with an actual user UID if you want to impersonate a specific user
    const token = await admin.auth().createCustomToken('kipackjeong');
    console.log('Custom token generated:');
    console.log(token);

    console.log('\nTo use this token in a REST API call for verifying and getting an ID token:');
    console.log('curl https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyDZhx_R7zOJm1g3w7asJUNMppn9h4aZf3U \\');
    console.log('-H "Content-Type: application/json" \\');
    console.log(`--data-binary '{"token":"${token}","returnSecureToken":true}'`);
  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    // Exit process to avoid hanging
    process.exit(0);
  }
}

generateToken();
