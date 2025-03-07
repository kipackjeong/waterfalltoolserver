import * as path from 'path';
import { encryptEnvFile } from '../utils/env-crypto';

// Get the root directory of the server
const rootDir = path.resolve(__dirname, '../..');
const sourceEnvPath = path.join(rootDir, '.env');
const distDir = path.join(rootDir, 'dist');
const encryptedEnvPath = path.join(distDir, 'env.encrypted');

// Encrypt the .env file and save to dist directory
const success = encryptEnvFile(sourceEnvPath, encryptedEnvPath);

if (success) {
  console.log('✅ Environment file encrypted successfully');
  process.exit(0);
} else {
  console.error('❌ Failed to encrypt environment file');
  process.exit(1);
}
