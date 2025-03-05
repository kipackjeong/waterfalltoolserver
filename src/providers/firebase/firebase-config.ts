import { ConfigService } from '@nestjs/config';

export const getFirebaseConfig = (configService: ConfigService) => {
  console.log('Loading Firebase config from environment variables...');
  // Get the private key and replace escaped newlines with actual newlines
  const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');
  console.log('Private key exists:', !!privateKey);

  // If private key exists but might be improperly formatted
  if (privateKey && !privateKey.includes('\n') && !privateKey.includes('\r\n')) {
    console.log('Warning: Private key might not be properly formatted with newlines');
  }
  const formattedPrivateKey = privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;

  // Log each environment variable (without exposing sensitive values)
  console.log('FIREBASE_TYPE:', !!configService.get('FIREBASE_TYPE'));
  console.log('FIREBASE_PROJECT_ID:', !!configService.get('FIREBASE_PROJECT_ID'));
  console.log('FIREBASE_PRIVATE_KEY_ID:', !!configService.get('FIREBASE_PRIVATE_KEY_ID'));
  console.log('FIREBASE_CLIENT_EMAIL:', !!configService.get('FIREBASE_CLIENT_EMAIL'));
  console.log('FIREBASE_CLIENT_ID:', !!configService.get('FIREBASE_CLIENT_ID'));
  console.log('FIREBASE_AUTH_URI:', !!configService.get('FIREBASE_AUTH_URI'));
  console.log('FIREBASE_TOKEN_URI:', !!configService.get('FIREBASE_TOKEN_URI'));
  console.log('FIREBASE_AUTH_PROVIDER_X509_CERT_URL:', !!configService.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'));
  console.log('FIREBASE_CLIENT_X509_CERT_URL:', !!configService.get('FIREBASE_CLIENT_X509_CERT_URL'));
  console.log('FIREBASE_UNIVERSE_DOMAIN:', !!configService.get('FIREBASE_UNIVERSE_DOMAIN'));

  const firebaseConfig = {
    type: configService.get('FIREBASE_TYPE'),
    project_id: configService.get('FIREBASE_PROJECT_ID'),
    private_key_id: configService.get('FIREBASE_PRIVATE_KEY_ID'),
    private_key: formattedPrivateKey,
    client_email: configService.get('FIREBASE_CLIENT_EMAIL'),
    client_id: configService.get('FIREBASE_CLIENT_ID'),
    auth_uri: configService.get('FIREBASE_AUTH_URI'),
    token_uri: configService.get('FIREBASE_TOKEN_URI'),
    auth_provider_x509_cert_url: configService.get(
      'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    ),
    client_x509_cert_url: configService.get('FIREBASE_CLIENT_X509_CERT_URL'),
    universe_domain: configService.get('FIREBASE_UNIVERSE_DOMAIN'),
  };

  // Validate required configuration properties
  const requiredProps = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email'
  ];

  const missingProps = requiredProps.filter(prop => !firebaseConfig[prop]);

  if (missingProps.length > 0) {
    const errorMsg = `Missing required Firebase configuration: ${missingProps.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('Firebase configuration successfully loaded');

  return firebaseConfig;
};

export default getFirebaseConfig;
