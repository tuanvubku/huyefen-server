import { Controller, Post, Param, Body, HttpStatus, HttpException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { ResponseSuccess } from '@/utils/dto/response.dto';
import { DeviceService } from './device.service';
import { IDevice } from './interface/device.interface';
import { NotificationService } from '@/notification/notification.service';
import { MessageDto } from '@/notification/dto/message.dto';

@Controller('device')
export class DeviceController {

    constructor(private readonly deviceService: DeviceService,
        private readonly notificationService: NotificationService) { }

    @Post()
    async createDevice(
        @Param('customerId') customerId: string,
        @Body() body: CreateDeviceDto
    ): Promise<any> {
        const fcmToken = body.fcmToken;
        if (fcmToken) {
            const device = {
                customerId,
                token: fcmToken
            } as IDevice;
            const result = await this.deviceService.saveDevice(device);
            return new ResponseSuccess("DEVICE.CREATE_SUCCESS", result)
        }
        throw new HttpException("FCM_TOKEN.NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    @Post('/:customerId/messages')
    async sendNotification(
        @Param('customerId') customerId: string,
        @Body() message: MessageDto): Promise<any> {
        const device: IDevice = await this.deviceService.getDevice(customerId);
        if (device) {
            const fcmToken: string = device.token;
            const data = await this.notificationService.sendNotification(fcmToken, message);
            if (data) {
                //save message to database
                return new ResponseSuccess("SEND_NOTI.SUCCESS", data)
            }
        }
        throw new Error('Unprocessable Entity');
    }

}
