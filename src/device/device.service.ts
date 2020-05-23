import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IDevice } from './interface/device.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class DeviceService {

    constructor(@InjectModel('Device') private readonly deviceModel: Model<IDevice>) { }

    async saveDevice(device: IDevice): Promise<IDevice> {
        if (device.customerId) {
            const newDevice = await this.deviceModel.create(device);
            if (!newDevice)
                throw new HttpException("ERROR", HttpStatus.INTERNAL_SERVER_ERROR)
            return newDevice;
        }
    }

    async getDevice(customerId: string): Promise<IDevice> {
        return await this.deviceModel.findOne({ customerId }).exec();
    }

    async deleteDevice(customerId: string): Promise<any> {
        return await this.deviceModel.deleteOne({ customerId }).exec();
    }
}
