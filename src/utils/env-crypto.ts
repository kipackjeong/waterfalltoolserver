import * as fs from 'fs';
import * as CryptoJS from 'crypto-js';

// The encryption key should be stored securely and not in source code for production
// For better security, this should come from a separate environment variable or secure storage
const ENCRYPTION_KEY = process.env.ENV_ENCRYPTION_KEY || 'WaterFallToolSecureKey123!';

/**
 * Encrypts the contents of an .env file and saves it as .env.encrypted
 * @param sourcePath Path to the source .env file
 * @param destinationPath Path where the encrypted file will be saved
 * @returns boolean indicating success
 */
export function encryptEnvFile(
  sourcePath: string,
  destinationPath: string,
): boolean {
  try {
    // Read the .env file
    const envContent = fs.readFileSync(sourcePath, 'utf8');

    // Encrypt the content
    const encryptedContent = CryptoJS.AES.encrypt(
      envContent,
      ENCRYPTION_KEY
    ).toString();

    // Write the encrypted content to the destination file
    fs.writeFileSync(destinationPath, encryptedContent);

    console.log(`Successfully encrypted .env file to ${destinationPath}`);
    return true;
  } catch (err) {
    console.error('Error encrypting .env file:', err);
    return false;
  }
}

/**
 * Decrypts an encrypted .env file and loads its contents into process.env
 * @param encryptedFilePath Path to the encrypted .env file
 * @returns boolean indicating success
 */
export function decryptAndLoadEnv(encryptedFilePath: string): boolean {
  try {
    // Check if the encrypted file exists
    if (!fs.existsSync(encryptedFilePath)) {
      console.error(`Encrypted file not found at ${encryptedFilePath}`);
      return false;
    }

    // Read the encrypted file
    const encryptedContent = fs.readFileSync(encryptedFilePath, 'utf8');
    console.log('[DEBUG] encryptedContent:', encryptedContent);

    // Decrypt the content
    const decryptedContent = CryptoJS.AES.decrypt(
      encryptedContent,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    console.log('[DEBUG] decryptedContent:', decryptedContent);

    if (!decryptedContent) {
      console.error('Failed to decrypt environment file');
      return false;
    }

    // Parse the decrypted content (similar to how dotenv works)
    const envVars = decryptedContent.split('\n');
    console.log("[DEBUG] envVars: ", envVars);

    for (const line of envVars) {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Split on the first equals sign (to handle values that contain =)
      const equalsIndex = line.indexOf('=');
      if (equalsIndex > 0) {
        const key = line.slice(0, equalsIndex).trim();
        let value = line.slice(equalsIndex + 1).trim();

        // Handle quoted values
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        // Set the env variable
        process.env[key] = value;
        console.log(`Loaded environment variable: ${key}=${value}`);
      }
    }

    console.log('Successfully decrypted and loaded environment variables');
    return true;
  } catch (err) {
    console.error('Error decrypting and loading .env file:', err);
    return false;
  }
}
