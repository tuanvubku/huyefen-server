import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopic } from './interfaces/topic.interface';

@Injectable()
export class TopicService {
    constructor (
        @InjectModel('Topic') private readonly topicModel: Model<ITopic>
    ) {
        (this.topicModel as any).createMapping(function (err, mapping) {
            if (err) {
                //console.log('error creating mapping (you can safely ignore this)');
                //console.log(err);
            } else {
                //console.log('mapping created!');
                //console.log(mapping);
            }
        });
        (this.topicModel as any).esTruncate(function (err) {
            let stream = (topicModel as any).synchronize();
            let count = 0
            stream.on('data', () => {
                count++
            })
            stream.on('close', () => {
                console.log(`Indexed completed ${count}`)
            })
            stream.on('error', (err) => {
                console.log(err)
            })
        })
    }

    async fetch(): Promise<ITopic[]> {
        return await this.topicModel.find();
    }

    async create(title: string): Promise<ITopic> {
        let topic: ITopic = new this.topicModel({
            title,
            suggest: title.split(" ")
        });
        topic.suggest.push(title);
        topic = await topic.save();

        let _topic = topic as ITopic as any;
        _topic.on("es-indexed", (err, res) => {
            if (err) throw err;
        })

        return topic;
    }

    async delete(topicId: string): Promise<boolean> {
        const { deletedCount } = await this.topicModel
            .deleteOne({ _id: topicId });
        return !!deletedCount;
    }

    handleSuggestData(data: Array<Object>) {
        const topics = [];
        data.forEach(data => {
            topics.push({
                name: data['_source'].title,
                _id: data['_id']
            })
        })
        return topics;
    }
    async getTopicSuggest(keyword: string, response) {
        return new Promise((resolve, reject) => {
            (this.topicModel as any).search(null, {
                suggest: {
                    "topic-suggest": {
                        "text": keyword,
                        "completion": {
                            "field": "suggest"
                        }
                    }
                }
            },
                async (err, results) => {
                    if (err) {
                        reject(err)
                    }
                    const result =  this.handleSuggestData(results.suggest['topic-suggest'][0].options);
                    response.topics = result;
                    resolve();
                    
                })
        })
    }

    async searchTopic(query: string, page: number, pageSize: number): Promise<any> {
        return new Promise((resolve, reject) => {
            (this.topicModel as any).search(
                {
                    "multi_match": {
                        "fields": ["title"],
                        "query": query,
                        "fuzziness": "AUTO"
                    }
                },
                {
                    from: (page - 1) * pageSize,
                    size: pageSize,
                    hydrate: true
                },
                async (err, results) => {
                    if (err) {
                        reject(err)
                    }
                    const result = results.hits.hits.map(teacher => {
                        const { title } = teacher;
                        const returnTopic = {
                            _id: teacher._id,
                            title
                        };
                        return returnTopic;
                    })
                
                    const respond = {
                        total: results.hits.total,
                        list: result
                    }
                    resolve(respond);
                })
        })
    }
}
