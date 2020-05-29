import { HttpException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';


@Injectable()
export class SearchService {

    private readonly index = 'course';

    constructor(private readonly elasticsearchService: ElasticsearchService) {
        console.log("Start elastic search");

        this.elasticsearchService.indices.exists({
            index: this.index
        }).then((exists) => {
            console.log("Check parsing data elasticsearch: " + exists.body)
            if (!exists.body) {
                this.elasticsearchService.indices.create({
                    index: this.index
                }).then(res => {
                    this.putMappingElastic();
                }).catch(err =>
                    console.log("Err " + err)
                )

            }
        })

    }

    putMappingElastic() {
        this.elasticsearchService.indices.putMapping({
            index: this.index,
            body: {
                properties: {
                    name: { type: "text" },
                    summary: { type: "text" },
                    avatar: { type: "text" },
                    authorsName: { type: "text" },
                    starRating: { type: "integer", index: false },
                    mongoId: { type: "text" },
                    suggest: {
                        analyzer: "simple",
                        search_analyzer: "simple",
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50,
                        type: "completion",
                    }
                }
            }
        }).then(res => console.log(res))
            .catch(err => console.log("Error parsing Huyefen: " + err))
    }

    async insertDocumentToElastic(doc: any) {

        const newDocWithSuggest = {
            ...doc,
            suggest: doc.name.split(" ")
        }
        return await this.elasticsearchService.index({
            index: this.index,
            id: doc['_id'],
            body: newDocWithSuggest
        })
            .then(res => ({ status: 'success', data: res }))
            .catch(err => {
                console.log("Connection err")
                throw new HttpException(err, 500);
            });
    }

    async searchIndex(keyword: string) {
        return await this.elasticsearchService.search({
            index: this.index,
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { name: keyword } },
                            { match: { summary: keyword } },
                            { match: { authorsName: keyword } }
                        ]
                    }
                }
            }
        })
            .then(res => ({ status: 'Success', data: res.body.hits.hits }))
            .catch(err => { throw new HttpException(err, 500); });
    }

    async getSuggestions(keyword: string) {
        return await this.elasticsearchService.search({
            index: this.index,
            body: {
                suggest: {
                    getSuggest: {
                        text: keyword,
                        completion: {
                            field: "suggest",
                            size: 5,
                            fuzzy: {
                                fuzziness: 2
                            }
                        }
                    }
                }
            }
        })
            .then(res => ({ status: 'Success', data: res }))
            .catch(err => { throw new HttpException(err, 500); });
    }
}
