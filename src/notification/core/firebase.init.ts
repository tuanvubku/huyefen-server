import { ProjectConfiguration } from './firebase.type'
import { credential } from 'firebase-admin';
import * as admin from "firebase-admin";
import { default as messagingConfiguration } from '../../config/firebase-configuration';

const project = messagingConfiguration.project as ProjectConfiguration
let initFirebase = null
if (!admin.apps.length) {
    initFirebase = admin.initializeApp({
        credential: credential.cert(project.serviceAccount),
        databaseURL: project.databaseURL,
    })
} else {
    initFirebase = admin.app()
}

export default initFirebase;
