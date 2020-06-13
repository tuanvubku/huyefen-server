import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class MessagingService {
    private readonly messaging = admin.messaging();

    sayHello(token: string): void {
        this.messaging.send({
            notification: {
                title: 'Hello',
                body: 'Hello, HuYeFen server!'
            },
            token
        });
    }

    async send(token: string, message: any): Promise<void> {
        try {
            await this.messaging.send({
                data: message.data,
                notification: {
                    ...message.notification,
                    imageUrl: 'https://i.ibb.co/WtcZtGw/logo-transparent-background.png'
                },
                token
            });
        }
        catch (e) {
            console.log(e.message);
        }
    }
}