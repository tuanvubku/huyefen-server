import { Injectable } from '@nestjs/common';
import { Firebase } from './core/firebase';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class NotificationService {

    constructor( private readonly firebase: Firebase) {
        this.firebase.configure();
    }

    async sendNotification(token: string, notification: MessageDto): Promise<any> {
        try {
            return await this.firebase.sendNotification( token, notification);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
