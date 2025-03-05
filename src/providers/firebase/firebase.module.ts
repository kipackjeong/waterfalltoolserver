import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigModule } from '@nestjs/config';
import { initializeFirebase } from './firebase-direct';
import { FirebaseService } from './firebase.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: () => {
                return initializeFirebase();
            },
        },
        FirebaseService
    ],
    exports: ['FIREBASE_ADMIN', FirebaseService],
})
export class FirebaseModule { }