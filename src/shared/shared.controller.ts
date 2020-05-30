import { Controller, Get, Body, UseGuards } from '@nestjs/common';
import { SharedService } from './shared.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorator/roles.decorator';
import { CreateURLDto } from './dto/create-url.dto';
import { User } from '@/utils/decorator/user.decorator';
import { UserService } from '@/user/user.service';

@Controller('shared')
export class SharedController {
  constructor(private readonly shareService: SharedService,
    private readonly userService: UserService
    ) {}

//   @Get('Post')
//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Roles('User','Teacher')
//   async convertBase64ToURL(@Body() createURLDto: CreateURLDto, @User() user): Promise<any> {
//     const url = await this.shareService.convertBase64ToURL(createURLDto.base64);
//     const userFromDB = await this.userService.findUserByPhone(user.phone);
//     userFromDB.avatar = url;
//     const updateUser = this.userService
//   }
}
