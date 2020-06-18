import { Controller, Put, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { ReviewCourseService } from './review-course.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('review-course')
export class ReviewCourseController {

    constructor (
        private readonly reviewCourseService: ReviewCourseService
    ) 
    {}

    @Put('/test/likes')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async updateLike(
        @Body('reviewId') reviewId: string,
        @Body('userLikeId') userLikeId: string
    ) {
        // validate user course
        const status = await this.reviewCourseService.updateLike(userLikeId, reviewId);
        return new ResponseSuccess("OK", status);
    }
}
