
import { ResponseSuccess } from '@/utils/utils';
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }
    
    @Get()
    async searchCourse(@Query() query: string ) {
        const results = await this.searchService.searchIndex(query['keyword']);
        return new ResponseSuccess("SUCCESS", results);
    }

    @Get('suggest')
    async getSuggestions(@Query() query: string ) {
        const results = await this.searchService.getSuggestions(query['keyword']);
        return new ResponseSuccess("SUCCESS", results);
    }
}
