import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../providers/firebase/firebase.service';
import * as admin from 'firebase-admin';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string;
  photoURL?: string | null;
  phoneNumber?: string | null;
  provider?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
  [key: string]: any;
}

@Injectable()
export class UsersService {
  private readonly COLLECTION_NAME = 'users';

  constructor(private readonly firebaseService: FirebaseService) { }

  /**
   * Find all users in the Firestore database
   * @returns Array of users
   */
  async findAll(): Promise<User[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME).get();
      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      return res;
    } catch (err) {
      console.error('Error finding all users:', err);
      throw err;
    }
  }

  /**
   * Get a list of users from Firebase Authentication
   * @returns ListUsersResult from Firebase Auth
   */
  async getAuthUsers() {
    try {
      const res = await this.firebaseService.getAuth().listUsers();
      return res;
    } catch (err) {
      console.error('Error listing auth users:', err);
      throw err;
    }
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User object or null if not found
   */
  async findById(id: string): Promise<User | null> {
    try {
      const res = await this.firebaseService.get<User>(this.COLLECTION_NAME, id);
      return res;
    } catch (err) {
      console.error(`Error finding user by ID ${id}:`, err);
      throw err;
    }
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User object or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.firebaseService
        .collection(this.COLLECTION_NAME)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const res = { id: doc.id, ...doc.data() } as User;
      return res;
    } catch (err) {
      console.error(`Error finding user by email ${email}:`, err);
      throw err;
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user with ID
   */
  async create(userData: Omit<User, 'id'>): Promise<User> {
    try {
      if (!userData.email) {
        throw new BadRequestException('Email is required');
      }

      // Check if user with same email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        return {
          ...existingUser,
          _duplicate: true,
        } as User & { _duplicate: boolean };
      }

      // Add timestamps and default values
      const data = {
        ...userData,
        isActive: userData.isActive ?? true,
        role: userData.role || 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Create the user document
      const id = await this.firebaseService.create(this.COLLECTION_NAME, data);

      // Return the created user (with a local Date since FieldValue can't be serialized)
      const res = {
        id,
        ...userData,
        isActive: userData.isActive ?? true,
        role: userData.role || 'user',
        createdAt: new Date(),
      };

      return res as User;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  /**
   * Update a user
   * @param id User ID
   * @param updateData Data to update
   * @returns Updated user object
   */
  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Prevent updates to critical fields
      const safeUpdateData = { ...updateData };
      // Don't allow direct updates to timestamps or id
      delete safeUpdateData.id;
      delete safeUpdateData.createdAt;

      // Add updated timestamp
      const data = {
        ...safeUpdateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Update the user
      await this.firebaseService.update(this.COLLECTION_NAME, id, data);

      // Return the updated user
      const res = {
        ...existingUser,
        ...safeUpdateData,
        updatedAt: new Date(),
      };

      return res;
    } catch (err) {
      console.error(`Error updating user ${id}:`, err);
      throw err;
    }
  }

  /**
   * Update multiple users at once
   * @param updates Array of user updates, each containing an ID
   * @returns Array of updated users
   */
  async updateMany(updates: Array<{ id: string } & Partial<User>>): Promise<(User | null)[]> {
    try {
      if (!Array.isArray(updates)) {
        throw new BadRequestException('Bulk update expects an array of user updates');
      }

      const res = await Promise.all(
        updates.map(async ({ id, ...data }) => {
          if (!id) {
            throw new BadRequestException('Each user update must include an id');
          }
          return this.update(id, data);
        })
      );

      return res;
    } catch (err) {
      console.error('Error updating multiple users:', err);
      throw err;
    }
  }

  /**
   * Remove a user by ID
   * @param id User ID to remove
   */
  async remove(id: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Delete the user from Firestore
      await this.firebaseService.delete(this.COLLECTION_NAME, id);

      // Optionally, you can also delete the user from Firebase Auth
      // if you want to completely remove them from the system
      try {
        await this.firebaseService.getAuth().deleteUser(id);
      } catch (authErr) {
        // Just log the error if auth deletion fails, but don't fail the whole operation
        // as the Firestore document has already been deleted
        console.warn(`Could not delete user from Auth: ${authErr.message}`);
      }
    } catch (err) {
      console.error(`Error removing user ${id}:`, err);
      throw err;
    }
  }
}
