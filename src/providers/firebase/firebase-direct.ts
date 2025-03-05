import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

// Initialize Firebase app directly - a simpler approach
export const initializeFirebase = () => {
  try {
    console.log('Initializing Firebase directly...');
    
    // First, check if we already have initialized the app
    if (admin.apps.length > 0) {
      console.log('Firebase app already initialized');
      return admin;
    }
    
    // First approach: Try with service account from a file
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (existsSync(serviceAccountPath)) {
      console.log(`Service account file found at: ${serviceAccountPath}`);
      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase initialized with service account file successfully');
        return admin;
      } catch (err) {
        console.error('Error reading service account file:', err);
        // Continue to try other methods if this fails
      }
    } else {
      console.log('No service account file found at', serviceAccountPath);
    }
    
    // Second approach: Try initializing with environment variables
    console.log('Attempting to initialize Firebase with environment variables');
    
    // Check if we have the required env vars
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('FIREBASE_PROJECT_ID exists:', !!projectId);
    console.log('FIREBASE_CLIENT_EMAIL exists:', !!clientEmail);
    console.log('FIREBASE_PRIVATE_KEY exists:', !!privateKey);
    
    if (projectId && clientEmail && privateKey) {
      try {
        const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formattedPrivateKey,
          } as admin.ServiceAccount),
        });
        console.log('Firebase initialized with environment variables successfully');
        return admin;
      } catch (err) {
        console.error('Error initializing Firebase with environment variables:', err);
      }
    }
    
    // Final approach: Try initializing with application default credentials
    try {
      console.log('Attempting to initialize Firebase with application default credentials');
      admin.initializeApp();
      console.log('Firebase initialized with application default credentials successfully');
      return admin;
    } catch (err) {
      console.error('Failed to initialize Firebase with application default credentials:', err);
      throw new Error('Could not initialize Firebase with any available method');
    }
  } catch (err) {
    console.error('Fatal error initializing Firebase:', err);
    throw err;
  }
};

export default initializeFirebase;
