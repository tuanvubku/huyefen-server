import { Controller, Post, Get } from '@nestjs/common';
import { SearchService } from './search.service';
import { ResponseSuccess } from 'src/utils/dto/response.dto';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }
    
    @Get()
    async searchCourse() {
        const results = await this.searchService.searchIndex();
        console.log(results)
        return new ResponseSuccess("SUCCESS", results);
    }
}
