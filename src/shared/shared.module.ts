import { Module } from '@nestjs/common';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [UserModule],
    controllers: [SharedController],
    providers: [SharedService]
})
export class SharedModule {}
