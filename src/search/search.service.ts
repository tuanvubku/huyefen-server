import { Injectable, HttpException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { CourseModule } from 'src/course/course.module';
@Injectable()
export class SearchService {

    constructor(private readonly elasticsearchService: ElasticsearchService) { }
    
    async insertDocumentToElastic(doc: any) {
        console.log("elasticsearch")

        return await this.elasticsearchService.index({
            index: 'course',
            id: doc['_id'],
            body: doc
        })
            .then(res => ({ status: 'success', data: res }))
            .catch(err => {
                console.log("Connection err")
                 throw new HttpException(err, 500); });
    }

    async searchIndex() {
        return await this.elasticsearchService.search({
            index: 'course',
            body: {
                query: {
                    match: {
                        name: "machine"
                    }
                }
            }
        })
            .then(res => ({ status: 'success', data: res.body.hits.hits }))
            .catch(err => { throw new HttpException(err, 500); });
    }

}
