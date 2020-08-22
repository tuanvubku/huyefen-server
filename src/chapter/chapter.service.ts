import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChapter } from './interfaces/chapter.interface';
import * as _ from 'lodash';
import { Lecture, ResourceType } from '@/config/constants';
import { ILecture } from './interfaces/lecture.interface';
import { IArticle } from '@/chapter/interfaces/article.interface';
import { ICaption, IResolution, IVideo } from '@/chapter/interfaces/video.interface';
import { IResource } from '@/chapter/interfaces/resource.interface';

@Injectable()
export class ChapterService {
    constructor (
        @InjectModel('Chapter') private readonly chapterModel: Model<IChapter>,
        @InjectModel('Article') private readonly articleModel: Model<IArticle>,
        @InjectModel('Video') private readonly videoModel: Model<IVideo>,
        @InjectModel('Resource') private readonly resourceModel: Model<IResource>,
        @InjectModel('Resolution') private readonly resolutionModel: Model<IResolution>,
        @InjectModel('Caption') private readonly captionModel: Model<ICaption>
    ) {}

    async fetchSyllabus(courseId: string): Promise<IChapter[]> {
        const syllabus: IChapter[] = await this.chapterModel
            .find({ course: courseId })
            .populate('owner', 'name avatar')
            .populate('lectures.owner', 'name avatar')
            .select({
                course: 0,
                'lecture.content': 0,
                'lecture.isPreviewed': 0
            });
        return syllabus;
    }

    async fetchChapters(courseId: string): Promise<any[]> {
        return await this.chapterModel
            .find({ course: courseId })
            .select({
                title: 1,
                'lectures.type': 1,
                'lectures.title': 1,
                'lectures._id': 1
            });
    }

    async create(teacherId: string, courseId: string, title: string, description: string): Promise<{ progress: number, data: IChapter}> {
        let chapter: IChapter = new this.chapterModel({
            title,
            description,
            course: courseId,
            owner: teacherId
        });
        chapter = await chapter.save();
        chapter = await this.chapterModel.findOne(chapter).populate('owner', 'name avatar');
        let progress: number = 50;
        const anotherChapters: IChapter[] = await this.chapterModel
                .find({
                    course: courseId,
                    _id: {
                        $ne: chapter._id
                    }
                });
        if (_.some(_.map(anotherChapters, chapter => _.size(chapter.lectures) > 0)))
            progress = 100;
        return {
            progress,
            data: chapter
        };
    }

    async validateChapter(courseId: string, chapterId: string): Promise<0 | -1 | 1> {
        const chapter = await this.chapterModel
            .findById(chapterId);
        if (!chapter) return 0;
        return chapter.course.toString() === courseId ? 1 : -1;
    }

    async update(teacherId: string, chapterId: string, title: string, description: string): Promise<IChapter> {
        try {
            const chapter: IChapter =  await this.chapterModel
                .findByIdAndUpdate(chapterId, {
                    title,
                    description,
                    owner: teacherId,
                    updatedAt: Date.now()
                }, {
                    new: true,
                    runValidators: true
                })
                .populate('owner', 'name avatar');
            
            return chapter;
        }
        catch (e) {
            if (e.name === 'ValidationError')
                throw new BadRequestException();
            throw e;
        }
    }

    async delete(courseId: string, chapterId: string): Promise<{ status: boolean, progress: number }> {
        const { deletedCount } = await this.chapterModel
            .deleteOne({
                _id: chapterId,
                course: courseId
            });
        if (deletedCount === 0)
            return { status: false, progress: null };
        const chapters: IChapter[] = await this.chapterModel
            .find({ course: courseId });
        let progress: number = _.isEmpty(chapters) ? 0 : 50;
        if (!_.isEmpty(chapters) && _.some(_.map(chapters, chapter => _.size(chapter.lectures) > 0)))
            progress = 100;
        return {
            status: true,
            progress
        };
    }
    
    async createLecture (
        teacherId: string,
        courseId: string,
        chapterId: string,
        title: string,
        type: Lecture
    ): Promise<{ status: boolean, data: ILecture }> {
        let contentResource = null;
        if (type === Lecture.Article) {
            contentResource = new this.articleModel();
        }
        else {
            contentResource = new this.videoModel();
        }
        let chapter: IChapter = await this.chapterModel
            .findOneAndUpdate({
                _id: chapterId,
                course: courseId
            }, {
                $push: {
                    lectures: {
                        title,
                        type,
                        owner: teacherId,
                        content: contentResource && contentResource._id
                    } as ILecture
                }
            }, {
                runValidators: true
            });
        if (!chapter) return { status: false, data: null };
        await contentResource.save();
        chapter = await this.chapterModel
            .findById(chapterId, {
                lectures: {
                    $slice: -1
                }
            })
            .populate('lectures.owner', 'name avatar')
            .select('-lectures.content -lectures.isPreviewed')
        return {
            status: true,
            data: chapter.lectures[0]
        };
    }

    async updateLecture(
        teacherId: string,
        courseId: string,
        chapterId: string,
        lectureId: string,
        title: string,
        type: Lecture
    ): Promise<{ status: 0 | -1 | 1, data: ILecture }> {
        let chapter: IChapter = await this.chapterModel
            .findOne({
                _id: chapterId,
                course: courseId,
                lectures: {
                    $elemMatch: {
                        _id: lectureId
                    }
                }
            }, {
                lectures: {
                    $elemMatch: { _id: lectureId }
                }
            });
        if (!chapter) return { status: 0, data: null };
        if (chapter.lectures[0].content && type !== chapter.lectures[0].type) return { status: -1, data: null };
        // chapter.lectures[0].owner = teacherId;
        // chapter.lectures[0].title = title;
        // chapter.lectures[0].type = type;
        // await chapter.save();
        chapter = await this.chapterModel
            .findByIdAndUpdate(chapterId, {
                $set: {
                    'lectures.$[element].type': type,
                    'lectures.$[element].title': title,
                    'lectures.$[element].owner': teacherId
                }
            }, {
                runValidators: true,
                arrayFilters: [{
                    'element._id': lectureId
                }],
                new: true
            })
            .populate('lectures.owner', 'name avatar')
            .select('-lectures.content -lectures.isPreviewed');
        const lecture = _.find(chapter.lectures, lecture => lecture._id.toString() === lectureId);
        return {
            status: 1,
            data: lecture
        };
    }

    async deleteLecture (
        courseId: string,
        chapterId: string,
        lectureId: string
    ): Promise<{ status: boolean, progress: number }> {
        const chapter = await this.chapterModel
            .findOneAndUpdate({
                _id: chapterId,
                course: courseId,
                lectures: {
                    $elemMatch: {
                        _id: lectureId
                    }
                }
            }, {
                $pull: {
                    lectures: {
                        _id: lectureId
                    }
                }
            })
        if (!chapter) return { status: false, progress: null };
        const lecture = _.find(chapter.lectures, lec => lec._id.toString() === lectureId);
        const contentId: string = lecture.content;
        const contentType: Lecture = lecture.type;
        //delete content with id and type.
        //delete video in folders.
        const chapters: IChapter[] = await this.chapterModel
            .find({ course: courseId });
        let progress: number = _.isEmpty(chapters) ? 0 : 50;
        if (!_.isEmpty(chapters) && _.some(_.map(chapters, chapter => _.size(chapter.lectures) > 0)))
            progress = 100;
        return {
            status: true,
            progress
        }
    }

    async fetchLecturesInfo(courseId: string): Promise<{ totalTime: number, numOfLectures: number }> {
        //totalTime???
        const chapters: IChapter[] = await this.chapterModel
            .find({ course: courseId });
        const numOfLectures: number = _.sum(_.map(chapters, chapter => _.size(chapter.lectures)));
        return {
            totalTime: 2,
            numOfLectures
        };
    }

    async fetchArticleLectureByTeacher(courseId: string, chapterId: string, lectureId: string): Promise<any> {
        let chapter = await this.chapterModel
          .findOne({
              _id: chapterId,
              course: courseId,
              lectures: {
                  $elemMatch: {
                      _id: lectureId,
                      type: Lecture.Article
                  }
              }
          }, {
              lectures: {
                  $elemMatch: { _id: lectureId }
              }
          })
          .populate('lectures.content')
          .populate('lectures.owner', 'avatar name')
          .select('-lectures.resources -lectures.description')
          .lean()
          .exec();
        if (!chapter) return null;
        const lecture = chapter.lectures[0];
        return {
            ..._.pick(lecture, ['_id', 'title', 'owner', 'type', 'updatedAt', 'isPreviewed']),
            //@ts-ignore
            ...lecture.content,
            chapter: _.pick(chapter, ['_id', 'title'])
        }
    }

    async fetchArticleLectureByUser(courseId: string, chapterId: string, lectureId: string): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Article
            }
          }
        })
        .populate('lectures.owner', 'avatar name')
        .lean()
        .exec();
      if (!chapter) return null;
      const maxLength: number = chapter.lectures.length;
      let lecture: any;
      let prev: any;
      let next: any;
      let lectureIndex: number;
      for (let i = 0; i < maxLength; ++i) {
        if (chapter.lectures[i]._id.toString() === lectureId && chapter.lectures[i].type === Lecture.Article) {
          lectureIndex = i;
          lecture = chapter.lectures[i];
          if (i === 0) {
            prev = null;
          }
          else {
            prev = _.pick(chapter.lectures[i - 1], ['_id', 'type']);
          }
          if (i === maxLength - 1) {
            next = null;
          }
          else {
            next = _.pick(chapter.lectures[i + 1], ['_id', 'type']);
          }
          break;
        }
      }
      const contentResourceId = lecture.content;
      const article = await this.articleModel
        .findById(contentResourceId);
      const resources = {
        downloadable: [],
        external: []
      };
      lecture.resources.forEach(item => {
        if (item.type === 'downloadable') {
          resources.downloadable.push(item);
        }
        else {
          resources.external.push(item);
        }
      })
      return {
        ..._.pick(lecture, ['_id', 'title', 'owner', 'type', 'updatedAt', 'description']),
        resources,
        content: article.content,
        duration: (article.estimateHour) * 60 + (article.estimateMinute),
        prevLecture: prev,
        nextLecture: next,
        chapter: _.pick(chapter, ['_id', 'title']),
        lectureIndex
      }
    }

    async fetchVideoLectureByTeacher(courseId: string, chapterId: string, lectureId: string) {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Video
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
        .populate('lectures.content')
        .populate('lectures.owner', 'avatar name')
        .select('-lectures.resources -lectures.description')
        .lean()
        .exec();
      if (!chapter) return null;
      const lecture = chapter.lectures[0];
      return {
        ..._.pick(lecture, ['_id', 'title', 'owner', 'type', 'updatedAt', 'isPreviewed']),
        //@ts-ignore
        ...lecture.content,
        chapter: _.pick(chapter, ['_id', 'title'])
      }
    }

  async fetchVideoLectureByUser(courseId: string, chapterId: string, lectureId: string) {
    let chapter = await this.chapterModel
      .findOne({
        _id: chapterId,
        course: courseId,
        lectures: {
          $elemMatch: {
            _id: lectureId,
            type: Lecture.Video
          }
        }
      })
      .populate('lectures.owner', 'avatar name')
      .lean()
      .exec();
    if (!chapter) return null;
    const maxLength: number = chapter.lectures.length;
    let lecture: any;
    let prev: any;
    let next: any;
    let lectureIndex: number;
    for (let i = 0; i < maxLength; ++i) {
      if (chapter.lectures[i]._id.toString() === lectureId && chapter.lectures[i].type === Lecture.Video) {
        lectureIndex = i;
        lecture = chapter.lectures[i];
        if (i === 0) {
          prev = null;
        }
        else {
          prev = _.pick(chapter.lectures[i - 1], ['_id', 'type']);
        }
        if (i === maxLength - 1) {
          next = null;
        }
        else {
          next = _.pick(chapter.lectures[i + 1], ['_id', 'type']);
        }
        break;
      }
    }
    const contentResourceId = lecture.content;
    const video = await this.videoModel
      .findById(contentResourceId)
      .lean()
      .exec();
    const resources = {
      downloadable: [],
      external: []
    };
    lecture.resources.forEach(item => {
      if (item.type === 'downloadable') {
        resources.downloadable.push(item);
      }
      else {
        resources.external.push(item);
      }
    })
    return {
      ..._.pick(lecture, ['_id', 'title', 'owner', 'type', 'updatedAt', 'description']),
      resources,
      ..._.pick(video, ['isDownloadable', 'captions', 'resolutions']),
      prevLecture: prev,
      nextLecture: next,
      chapter: _.pick(chapter, ['_id', 'title']),
      lectureIndex
    }
  }

    async updateArticleContent(courseId: string, chapterId: string, lectureId: string, newContent: string): Promise<boolean> {
        let chapter = await this.chapterModel
          .findOne({
              _id: chapterId,
              course: courseId,
              lectures: {
                  $elemMatch: {
                      _id: lectureId,
                      type: Lecture.Article
                  }
              }
          }, {
              lectures: {
                  $elemMatch: { _id: lectureId }
              }
          })
          .lean()
          .exec();
        if (!chapter) return false;
        const contentResourceId = chapter.lectures[0] && chapter.lectures[0].content;
        if (!contentResourceId) return false;
        await this.articleModel
          .updateOne({
              _id: contentResourceId
          }, {
              $set: {
                  content: newContent
              }
          }, {
              runValidators: true
          });
        return true;
    }

    async updateArticleLecturePreview(courseId: string, chapterId: string, lectureId: string, previewVal: boolean): Promise<boolean> {
        let chapter = await this.chapterModel
          .findOne({
              _id: chapterId,
              course: courseId,
              lectures: {
                  $elemMatch: {
                      _id: lectureId,
                      type: Lecture.Article
                  }
              }
          }, {
              lectures: {
                  $elemMatch: { _id: lectureId }
              }
          })
        if (!chapter) return false;
        chapter.lectures[0].isPreviewed = previewVal;
        await chapter.save();
        return true;
    }

    async updateArticleLectureEstimateTime(courseId: string, chapterId: string, lectureId: string, hour: number, minute: number): Promise<boolean> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Article
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) return false;
      const contentResourceId = chapter.lectures[0].content;
      await this.articleModel
        .updateOne({
          _id: contentResourceId
        }, {
          $set: {
            estimateHour: hour,
            estimateMinute: minute
          }
        });
      return true;
    }

    async fetchLectureDescriptionForTeacher(courseId: string, chapterId: string, lectureId: string): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        });
      if (!chapter) return false;
      return chapter.lectures[0].description || '';
    }

    async updateLectureDescription(courseId: string, chapterId: string, lectureId: string, newContent: string): Promise<boolean> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) return false;
      chapter.lectures[0].description = newContent;
      await chapter.save();
      return true;
    }

    async addResourceForLecture(courseId: string, chapterId: string, lectureId: string, resource: any): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) return false;
      console.log(resource);
      const newResource = new this.resourceModel(resource);
      chapter.lectures[0].resources.push(newResource);
      await chapter.save();
      return newResource;
    }

    async fetchResourcesLecture(courseId: string, chapterId: string, lectureId: string): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) return false;
      const resources = chapter.lectures[0].resources;
      const result = {
        [ResourceType.Downloadable]: [],
        [ResourceType.External]: []
      };
      resources.forEach(resource => {
        result[resource.type].push(resource);
      });
      return result;
    }

    async addVideoResolutionsForLecture(courseId: string, chapterId: string, lectureId: string, resArr: Array<any>): Promise<boolean> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Video
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) {
        return false;
      };
      const videoResourceId: string = chapter.lectures[0].content;
      const resolutionItems: IResolution[] = _.map(resArr, resItem => {
        return new this.resolutionModel({
          ...resItem
        });
      })
      await this.videoModel
        .findByIdAndUpdate(videoResourceId, {
          $set: {
            resolutions: resolutionItems
          }
        });
      return true;
    }

    async updateVideoLectureCaption(courseId: string, chapterId: string, lectureId: string, lang: string, label: string, src: string): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Video
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) {
        return false;
      };
      const newCaption = new this.captionModel({
        srcLang: lang,
        label: label,
        src: src
      });
      const videoId = chapter.lectures[0].content;
      await this.videoModel
        .findByIdAndUpdate(videoId, {
          $push: {
            captions: newCaption
          }
        });
      return newCaption;
    }

    async deleteVideoLectureCaption(courseId: string, chapterId: string, lectureId: string, captionId: string): Promise<any> {
      let chapter = await this.chapterModel
        .findOne({
          _id: chapterId,
          course: courseId,
          lectures: {
            $elemMatch: {
              _id: lectureId,
              type: Lecture.Video
            }
          }
        }, {
          lectures: {
            $elemMatch: { _id: lectureId }
          }
        })
      if (!chapter) {
        return false;
      };
      const videoId = chapter.lectures[0].content;
      await this.videoModel
        .updateOne({
          _id: videoId
        }, {
          $pull: {
            captions: {
              _id: captionId
            }
          }
        });
      return true;
    }
}
