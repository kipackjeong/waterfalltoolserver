import {
  Injectable,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { FirebaseService } from '../../providers/firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      console.log('registerDto:', registerDto);
      console.log('Initializing Firebase Auth...');

      // Check if Firebase service is properly initialized
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        console.error('Firebase Auth is not properly initialized');
        throw new Error('Firebase Auth is not properly initialized');
      }

      console.log('Firebase Auth initialized successfully');

      let userRecord;
      // Create the user in Firebase Authentication with more detailed error handling
      try {
        userRecord = await auth.createUser({
          email: registerDto.email,
          password: registerDto.password,
          displayName: `${registerDto.firstName || ''} ${registerDto.lastName || ''}`.trim(),
        });
        console.log('userRecord:', userRecord);
      } catch (error) {
        console.error('Error creating user in Firebase Auth:', error);
        throw error;
      }

      // Store additional user data in Firestore
      const userData = {
        email: registerDto.email,
        displayName: `${registerDto.firstName || ''} ${registerDto.lastName || ''}`.trim(),
        provider: 'email',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save the user to your database
      await this.firebaseService.getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userData);

      // Generate custom token for the user
      const token = await this.firebaseService.getAuth().createCustomToken(userRecord.uid);

      return {
        user: {
          id: userRecord.uid,
          email: registerDto.email,
          displayName: `${registerDto.firstName || ''} ${registerDto.lastName || ''}`.trim(),
        },
        token,
      };
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }

  async login(loginDto: LoginDto) {
    // Verify email and password
    // Note: Firebase Admin SDK doesn't have direct email/password authentication
    // We would typically use Firebase Client SDK for this
    // This is a simplified implementation

    // Find the user by email in Firebase Auth
    const userRecord = await this.firebaseService.getAuth()
      .getUserByEmail(loginDto.email)
      .catch(() => {
        throw new UnauthorizedException('Invalid email or password');
      });

    // Generate a custom token for the authenticated user
    const token = await this.firebaseService.getAuth().createCustomToken(userRecord.uid);

    // Get user data from Firestore
    const userDoc = await this.firebaseService.getFirestore()
      .collection('users')
      .doc(userRecord.uid)
      .get();

    const userData = userDoc.data() || {};

    return {
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userData.displayName || null
      },
      token,
    };
  }
}
