import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';

@Controller('api/public')
export class PublicController {
  // @Get('/image/:imagePath')
  // async getImageFile(
  //   @Param('imagePath') imagePath: string,
  //   @Res() res
  // ): Promise<any> {
  //   console.log(imagePath);
  //   console.log("Test")
  //   return res.sendFile(imagePath, { root: join(__dirname, 'public') });
  // }
}
