import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../providers/firebase/firebase.service';

export interface Sample {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  tags?: string[];
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

@Injectable()
export class SamplesService {
  private readonly COLLECTION_NAME = 'samples';

  constructor(private readonly firebaseService: FirebaseService) { }

  /**
   * Find all samples in the Firestore database
   * @returns Array of samples
   */
  async findAll(): Promise<Sample[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME).get();
      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sample[];
      return res;
    } catch (err) {
      console.error('Error finding all samples:', err);
      throw err;
    }
  }

  /**
   * Find samples by user ID
   * @param userId User ID
   * @returns Array of samples
   */
  async findAllByUserId(userId: string): Promise<Sample[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .get();

      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sample[];

      return res;
    } catch (err) {
      console.error(`Error finding samples by userId ${userId}:`, err);
      throw err;
    }
  }

  /**
   * Find a sample by ID
   * @param id Sample ID
   * @returns Sample object or null if not found
   */
  async findById(id: string): Promise<Sample | null> {
    try {
      const doc = await this.firebaseService.collection(this.COLLECTION_NAME).doc(id).get();
      if (!doc.exists) {
        return null;
      }

      const res = {
        id: doc.id,
        ...doc.data(),
      } as Sample;

      return res;
    } catch (err) {
      console.error(`Error finding sample by id ${id}:`, err);
      throw err;
    }
  }

  /**
   * Create a new sample
   * @param sampleData Sample data to create
   * @returns Created sample with ID
   */
  async create(sampleData: Omit<Sample, 'id'>): Promise<Sample> {
    try {
      if (!sampleData.name) {
        throw new BadRequestException('Name is required');
      }

      // Add timestamps and default values
      const data = {
        ...sampleData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: sampleData.isActive !== undefined ? sampleData.isActive : true,
      };

      // Create the sample document
      const id = await this.firebaseService.create(this.COLLECTION_NAME, data);

      // Return the created sample
      const res = {
        id,
        ...data
      };

      return res as Sample;
    } catch (err) {
      console.error('Error creating sample:', err);
      throw err;
    }
  }

  /**
   * Update a sample
   * @param id Sample ID
   * @param updateData Data to update
   * @returns Updated sample object
   */
  async update(id: string, updateData: Partial<Sample>): Promise<Sample> {
    try {
      // Check if sample exists
      const existingSample = await this.findById(id);
      if (!existingSample) {
        throw new NotFoundException(`Sample with ID ${id} not found`);
      }

      // Add update timestamp
      const data = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Update the sample
      await this.firebaseService.update(this.COLLECTION_NAME, id, data);

      // Return the updated sample (merge existing with updates)
      const res = {
        ...existingSample,
        ...data,
        id,
      };

      return res;
    } catch (err) {
      console.error(`Error updating sample ${id}:`, err);
      throw err;
    }
  }

  /**
   * Update multiple samples at once
   * @param updates Array of sample updates, each containing an ID
   * @returns Array of updated samples
   */
  async updateMany(updates: Array<{ id: string } & Partial<Sample>>): Promise<(Sample | null)[]> {
    try {
      const updatePromises = updates.map(update => {
        const { id, ...updateData } = update;
        return this.update(id, updateData);
      });

      return await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error updating multiple samples:', err);
      throw err;
    }
  }

  /**
   * Remove a sample by ID
   * @param id Sample ID to remove
   */
  async remove(id: string): Promise<void> {
    try {
      // Check if sample exists
      const existingSample = await this.findById(id);
      if (!existingSample) {
        throw new NotFoundException(`Sample with ID ${id} not found`);
      }

      // Delete the sample
      await this.firebaseService.delete(this.COLLECTION_NAME, id);
    } catch (err) {
      console.error(`Error removing sample ${id}:`, err);
      throw err;
    }
  }
}
