import { Module, DynamicModule, Global } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import * as admin from 'firebase-admin';

@Global()
@Module({})
export class FirebaseModule {
    static register(): DynamicModule {
        if (!admin.apps.length) {
            const serviceAccount = require('@/serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://huyefen-2102.firebaseio.com"
            });
        }
        return {
            module: FirebaseModule,
            providers: [MessagingService],
            exports: [MessagingService]
        };
    }
}
