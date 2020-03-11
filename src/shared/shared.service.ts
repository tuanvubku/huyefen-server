import { Injectable } from '@nestjs/common';
@Injectable()
export class SharedService {
    
    async convertBase64ToURL(base64: string) {
        const url = Buffer.from(base64, "base64").toString('utf8');
        return  url;
    }

}
