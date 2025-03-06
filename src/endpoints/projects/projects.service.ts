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
   * @param userId User ID
   * @returns Array of projects
   */
  async findAllByUserId(userId: string): Promise<Project[]> {
    try {
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .get();

      const res = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      console.log('res:', res)

      return res;
    } catch (err) {
      console.error(`Error finding projects by userId ${userId}:`, err);
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
      if (!projectData.name) {
        throw new BadRequestException('Name is required');
      }
      projectData.createdAt = new Date();
      
      // Sort sqlServers, databases, and tables if they exist in the projectData
      if (projectData.sqlServers && Array.isArray(projectData.sqlServers)) {
        // Sort sqlServers by name
        projectData.sqlServers = sortArrayByName(projectData.sqlServers);
        
        // Sort databases within each sqlServer
        projectData.sqlServers.forEach(server => {
          if (server.databases && Array.isArray(server.databases)) {
            server.databases = sortArrayByName(server.databases);
            
            // Sort tables within each database
            server.databases.forEach(db => {
              if (db.tables && Array.isArray(db.tables)) {
                db.tables = sortArrayByName(db.tables);
              }
            });
          }
        });
      }
      
      // Check if a project with the same name already exists
      const snapshot = await this.firebaseService.collection(this.COLLECTION_NAME)
        .where('name', '==', projectData.name)
        .limit(1)
        .get();

      // If a project with the same name exists, merge it with the new data
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const existingProject = { id: existingDoc.id, ...existingDoc.data() } as Project;

        // Deep merge the existing project with the new data
        const mergedProject = deepMergeProjects(existingProject, projectData as Project);
        
        // Ensure all arrays in the merged project are sorted
        sortProjectArrays(mergedProject);

        // Update the existing project with the merged data
        await this.firebaseService.update(this.COLLECTION_NAME, existingProject.id, mergedProject);

        // Return the merged project with the _duplicate flag
        const res = {
          ...mergedProject,
          id: existingProject.id,
          _duplicate: true
        };

        return res as Project & { _duplicate: boolean };
      }

      // Add timestamps and default values
      const data = {
        ...projectData
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



/**
 * Deep merges two projects, maintaining the hierarchy structure at all levels
 * This is particularly useful for preserving data that might be missing in updates
 */
/**
 * Sorts an array of objects by their name property
 */
const sortArrayByName = <T extends { name: string }>(array: T[]): T[] => {
  return [...array].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Sorts all arrays in a project (sqlServers, databases, tables)
 */
const sortProjectArrays = (project: Project): void => {
  if (project.sqlServers && Array.isArray(project.sqlServers)) {
    // Sort sqlServers by name
    project.sqlServers = sortArrayByName(project.sqlServers);
    
    // Sort databases within each sqlServer
    project.sqlServers.forEach(server => {
      if (server.databases && Array.isArray(server.databases)) {
        server.databases = sortArrayByName(server.databases);
        
        // Sort tables within each database
        server.databases.forEach(db => {
          if (db.tables && Array.isArray(db.tables)) {
            db.tables = sortArrayByName(db.tables);
          }
        });
      }
    });
  }
};

/**
 * Deep merges two projects, maintaining the hierarchy structure at all levels
 * This is particularly useful for preserving data that might be missing in updates
 */
const deepMergeProjects = (existingProject: Project, newProject: Project): Project => {
  if (!existingProject || !newProject) return newProject || existingProject;

  // Create a base merged project with primitive properties
  const merged: Project = { ...existingProject, ...newProject };

  // Ensure userId consistency - prioritize existing userId if available
  merged.userId = existingProject.userId || newProject.userId;

  // If the new project has SQL server models, we need to merge them with existing ones
  if (newProject.sqlServers && existingProject.sqlServers) {
    // Create a map of existing servers by name for easy lookup
    const existingServersMap = existingProject.sqlServers.reduce((map, server) => {
      map[server.name] = server;
      return map;
    }, {});

    // Create merged SQL server models array
    merged.sqlServers = newProject.sqlServers.map(newServer => {
      const existingServer = existingServersMap[newServer.name];

      // If this server doesn't exist in the existing project, use the new server as is
      if (!existingServer) return newServer;

      // Merge the server properties
      const mergedServer = { ...existingServer, ...newServer };

      // If the new server has databases, we need to merge them with existing ones
      if (newServer.databases && existingServer.databases) {
        // Create a map of existing databases by name for easy lookup
        const existingDbMap = existingServer.databases.reduce((map, db) => {
          map[db.name] = db;
          return map;
        }, {});

        // Create merged databases array
        mergedServer.databases = newServer.databases.map(newDb => {
          const existingDb = existingDbMap[newDb.name];

          // If this database doesn't exist in the existing server, use the new database as is
          if (!existingDb) return newDb;

          // Merge the database properties
          const mergedDb = { ...existingDb, ...newDb };

          // If the new database has tables, we need to merge them with existing ones
          if (newDb.tables && existingDb.tables) {
            // Create a map of existing tables by name for easy lookup
            const existingTableMap = existingDb.tables.reduce((map, table) => {
              map[table.name] = table;
              return map;
            }, {});

            // Create merged tables array starting with tables from the new project
            const mergedTables = newDb.tables.map(newTable => {
              const existingTable = existingTableMap[newTable.name];

              // If this table doesn't exist in the existing database, use the new table as is
              if (!existingTable) return newTable;

              // Merge the table properties
              return { ...existingTable, ...newTable };
            });

            // Also include any tables from the existing database that aren't in the new database
            const newTableNames = new Set(newDb.tables.map(t => t.name));
            const missingTables = existingDb.tables.filter(table => !newTableNames.has(table.name));

            // Set the merged tables array including both new and existing tables
            mergedDb.tables = [...mergedTables, ...missingTables];
          }

          return mergedDb;
        });
      }

      return mergedServer;
    });

    // Also include any servers from the existing project that aren't in the new project
    const newServerNames = new Set(newProject.sqlServers.map(s => s.name));
    const missingServers = existingProject.sqlServers.filter(server => !newServerNames.has(server.name));
    merged.sqlServers = [...merged.sqlServers, ...missingServers];
  }

  // Update the timestamps
  merged.updatedAt = new Date().toISOString();

  // Ensure all arrays are sorted
  sortProjectArrays(merged);

  return merged;
};