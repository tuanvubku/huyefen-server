import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PurchaseHistoryService } from '@/purchase-history/purchase-history.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { IResponse } from '@/utils/interfaces/response.interface';
import { Role } from '@/config/constants';
import { User } from '@/utils/decorators/user.decorator';
import { ResponseSuccess } from '@/utils/utils';

@Controller('api/purchase-history')
export class PurchaseHistoryController {
  constructor(
    private readonly purchaseHistoryService: PurchaseHistoryService
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  async fetchPurchaseHistory(
    @User() user,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number
  ): Promise<IResponse<any>> {
    const userId: string = user._id;
    const result = await this.purchaseHistoryService.fetchPurchaseHistory(userId, skip, limit);
    return new ResponseSuccess('FETCH_OK', result);
  }
}
