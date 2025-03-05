import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DocumentData, Firestore, WithFieldValue } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService {
    private firestore: Firestore;
    private auth: admin.auth.Auth;

    constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin) {
        this.firestore = this.firebaseAdmin.firestore();
        this.auth = this.firebaseAdmin.auth();
    }

    getAuth() {
        return this.auth;
    }

    getFirestore() {
        return this.firestore;
    }

    // Get a reference to a specific collection
    collection(collectionName: string) {
        return this.firestore.collection(collectionName);
    }

    // Create a document with auto-generated ID
    async create<T>(collectionName: string, data: T): Promise<string> {
        try {
            const docRef = await this.collection(collectionName).add(data as WithFieldValue<DocumentData>);
            return docRef.id;
        } catch (err) {
            console.error(`Error creating document in ${collectionName}:`, err);
            throw err;
        }
    }

    // Create a document with a specific ID
    async set<T>(collectionName: string, id: string, data: T): Promise<void> {
        try {
            await this.collection(collectionName).doc(id).set(data as WithFieldValue<DocumentData>);
        } catch (err) {
            console.error(`Error setting document ${id} in ${collectionName}:`, err);
            throw err;
        }
    }

    // Get a document by ID
    async get<T>(collectionName: string, id: string): Promise<T | null> {
        try {
            const doc = await this.collection(collectionName).doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return { id: doc.id, ...doc.data() } as T;
        } catch (err) {
            console.error(`Error getting document ${id} from ${collectionName}:`, err);
            throw err;
        }
    }

    // Update a document
    async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
        try {
            await this.collection(collectionName).doc(id).update(data);
        } catch (err) {
            console.error(`Error updating document ${id} in ${collectionName}:`, err);
            throw err;
        }
    }

    // Delete a document
    async delete(collectionName: string, id: string): Promise<void> {
        try {
            await this.collection(collectionName).doc(id).delete();
        } catch (err) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, err);
            throw err;
        }
    }
}
