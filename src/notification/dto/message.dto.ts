import { messaging } from 'firebase-admin';

export class MessageDto {
    readonly data?: { [key: string]: string };
    readonly notification?: messaging.Notification;
    readonly android?: messaging.AndroidConfig;
    readonly webpush?: messaging.WebpushConfig;
    readonly apns?: messaging.ApnsConfig;
}