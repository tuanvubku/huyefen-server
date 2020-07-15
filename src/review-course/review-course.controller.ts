import { Controller, Put, UseGuards, Body, Get, Post, Param, Query, ForbiddenException } from '@nestjs/common';
import { ReviewCourseService } from './review-course.service';

@Controller('review-course')
export class ReviewCourseController {

    constructor (
        private readonly reviewCourseService: ReviewCourseService
    ) {}

    
}
