import { Injectable } from '@nestjs/common';
import * as admin from "firebase-admin";
import initFirebase from './firebase.init';

@Injectable()
export class Firebase {
    private  ref: any;
    configure(): void {
        // const project = messagingConfiguration.project as ProjectConfiguration
        // this.ref = admin.initializeApp({
        //     credential: credential.cert(project.serviceAccount),
        //     databaseURL: project.databaseURL,
        // });
        this.ref = initFirebase;

    };

    async sendNotification( token: string, notification: any): Promise<any> {
        try {
            //const project = this.getProjectData(projectId);
            const data = { ...notification, token };
            return await admin.messaging(this.ref).send(data);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
