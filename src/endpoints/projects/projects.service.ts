import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../providers/firebase/firebase.service';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

@Injectable()
export class ProjectsService {
  private readonly COLLECTION_NAME = 'projects';

  constructor(private readonly firebaseService: FirebaseService) { }

  /**
   * Find all projects in the Firestore database
   * @returns Array of projects
   */
  async findAll(): Promise<Project[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME).get();
      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      return res;
    } catch (err) {
      console.error('Error finding all projects:', err);
      throw err;
    }
  }
  /**
   * Find projects by user ID
   * @param id User ID
   * @returns Array of projects
   */
  async findAllByUserId(id: string): Promise<Project[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME)
        .where('userId', '==', id)
        .get();

      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      return res;
    } catch (err) {
      console.error(`Error finding projects by userId ${id}:`, err);
      throw err;
    }
  }
  /**
   * Find a project by ID
   * @param id Project ID
   * @returns Project object or null if not found
   */
  async findById(id: string): Promise<Project | null> {
    try {
      const res = await this.firebaseService.get<Project>(this.COLLECTION_NAME, id);
      return res;
    } catch (err) {
      console.error(`Error finding project by ID ${id}:`, err);
      throw err;
    }
  }


  /**
   * Create a new project
   * @param projectData Project data to create
   * @returns Created project with ID
   */
  async create(projectData: Omit<Project, 'id'>): Promise<Project> {
    try {
      if (!projectData.email) {
        throw new BadRequestException('Email is required');
      }
      projectData.createdAt = new Date();
      // Add timestamps and default values
      const data = {
        ...projectData,
      };

      // Create the project document
      const id = await this.firebaseService.create(this.COLLECTION_NAME, data);

      // Return the created project (with a local Date since FieldValue can't be serialized)
      const res = {
        id,
        ...projectData
      };

      return res as Project;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  }

  /**
   * Update a project
   * @param id Project ID
   * @param updateData Data to update
   * @returns Updated project object
   */
  async update(id: string, updateData: Partial<Project>): Promise<Project> {
    try {
      // Check if project exists
      const existingProject = await this.findById(id);
      if (!existingProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Prevent updates to critical fields
      const safeUpdateData = { ...updateData };
      // Don't allow direct updates to timestamps or id
      delete safeUpdateData.id;
      delete safeUpdateData.createdAt;

      safeUpdateData.updatedAt = new Date();
      // Add updated timestamp
      const data = {
        ...safeUpdateData,
      };

      // Update the project
      await this.firebaseService.update(this.COLLECTION_NAME, id, data);

      // Return the updated project
      const res = {
        ...existingProject,
        ...safeUpdateData,
      };

      return res as Project;
    } catch (err) {
      console.error(`Error updating project ${id}:`, err);
      throw err;
    }
  }

  /**
   * Update multiple projects at once
   * @param updates Array of project updates, each containing an ID
   * @returns Array of updated projects
   */
  async updateMany(updates: Array<{ id: string } & Partial<Project>>): Promise<(Project | null)[]> {
    try {
      if (!Array.isArray(updates)) {
        throw new BadRequestException('Bulk update expects an array of project updates');
      }

      const res = await Promise.all(
        updates.map(async ({ id, ...data }) => {
          if (!id) {
            throw new BadRequestException('Each project update must include an id');
          }
          return this.update(id, data);
        })
      );

      return res;
    } catch (err) {
      console.error('Error updating multiple projects:', err);
      throw err;
    }
  }

  /**
   * Remove a project by ID
   * @param id Project ID to remove
   */
  async remove(id: string): Promise<void> {
    try {
      // Check if project exists
      const existingProject = await this.findById(id);
      if (!existingProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Delete the project from Firestore
      await this.firebaseService.delete(this.COLLECTION_NAME, id);

      // Optionally, you can also delete the project from Firebase Auth
      // if you want to completely remove them from the system
      try {
        await this.firebaseService.getAuth().deleteUser(id);
      } catch (authErr) {
        // Just log the error if auth deletion fails, but don't fail the whole operation
        // as the Firestore document has already been deleted
        console.warn(`Could not delete project from Auth: ${authErr.message}`);
      }
    } catch (err) {
      console.error(`Error removing project ${id}:`, err);
      throw err;
    }
  }
}
