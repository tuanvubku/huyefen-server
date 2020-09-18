import { AuthorService } from '@/author/author.service';
import { ChapterService } from '@/chapter/chapter.service';
import { IChapter } from '@/chapter/interfaces/chapter.interface';
import { ILecture } from '@/chapter/interfaces/lecture.interface';
import {
    Language,
    Lecture,
    Level,
    Price,
    Privacy,
    ProgressBase,
    Role,
    TeacherCoursesSort as Sort,
} from '@/config/constants';
import { PurchaseHistoryService } from '@/purchase-history/purchase-history.service';
import { ReviewCourseService } from '@/review-course/review-course.service';
import { ReviewTeacherService } from '@/review-teacher/review-teacher.service';
import { StudentService } from '@/student/student.service';
import { TeacherService } from '@/teacher/teacher.service';
import { UserService } from '@/user/user.service';
import {
    compareByScore,
    mapKeyToLanguage,
    mapKeyToLevel,
    mapKeyToPrice,
    mapStarValueToStarRangeObj, randomFromArray,
} from '@/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { UpdateGoalsDto } from './dtos/goals.dto';
import { UpdateLandingDto } from './dtos/landing.dto';
import { ICourse } from './interfaces/course.interface';
import { IRequirement } from './interfaces/requirement.interface';
import { ITargetStudent } from './interfaces/targetStudent.interface';
import { IWhatLearn } from './interfaces/whatLearn.interface';
import { ITeacher } from '@/teacher/interfaces/teacher.interface';
import { TopicService } from '@/topic/topic.service';
import { AreaService } from '@/area/area.service';
import * as recommendNetwork from '@/universal-recommender/api';

type IGoals = IWhatLearn | IRequirement | ITargetStudent;
type GoalFields = 'whatLearns' | 'requirements' | 'targetStudents';


@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private readonly courseModel: Model<ICourse>,
        private readonly authorService: AuthorService,
        private readonly chapterService: ChapterService,
        @Inject(forwardRef(() => TeacherService)) private teacherService: TeacherService,
        private readonly reviewTeacherService: ReviewTeacherService,
        private readonly reviewCourseService: ReviewCourseService,
        private readonly studentService: StudentService,
        private readonly userService: UserService,
        private readonly topicService: TopicService,
        private readonly purchaseHistoryService: PurchaseHistoryService,
        private readonly areaService: AreaService

    ) {
        (this.courseModel as any).createMapping(function (err, mapping) {
            if (err) {
                //console.log('error creating mapping (you can safely ignore this)');
                console.log(err);
            } else {
                //console.log('mapping created!');
                console.log(mapping);
            }
        });
        (this.courseModel as any).esTruncate(function (err) {
            let stream = (courseModel as any).synchronize();
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

    async create(teacherId: string, area: string, title: string): Promise<ICourse> {
        let course: ICourse = new this.courseModel({
            area,
            title,
            authors: [teacherId],
            suggest: title.split(" ")
        });

        course.suggest.push(title)

        course = await course.save();
        let _course = course as ICourse as any;
        _course.on("es-indexed", (err, res) => {
            if (err) throw err;
        })
        const courseId: string = course._id;
        await Promise.all([
            this.authorService.create(teacherId, courseId),
            this.teacherService.addCourse(teacherId, courseId),
            recommendNetwork.inputCourseData(courseId.toString(), {
                area: [area.toString()]
            })
        ]);
        return course;
    }

    // async test() {
    //     const subTitles = [
    //       'Much like setState in Class components created by extending React.Component or React.PureComponent, the state update using the updater provided by useState hook is also asynchronous, and will not be reflected immediately.',
    //       'Also, the main issue here is not just the asynchronous nature but the fact that state values are used by functions based on their current closures',
    //       'As far as the syntax to update state is concerned, setMovies(result) will replace the previous movies value in the state with those available from the async reques'
    //
    //     ];
    //     const levels = [Level.Expert, Level.Intermediate, Level.AllLevel, Level.Beginner];
    //     const languages = [Language.English, Language.Vietnamese];
    //     const category = ['5edcfb4a9e3ec67b94474593', '5edcfb5a9e3ec67b94474594'];
    //     const avatars = ['https://images.pexels.com/photos/682375/pexels-photo-682375.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    //     'https://images.pexels.com/photos/247583/pexels-photo-247583.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    //       'https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    //       'https://images.pexels.com/photos/1573134/pexels-photo-1573134.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    //     ];
    //     const courses = await this.courseModel.find({});
    //     courses.forEach(course => {
    //         course.subTitle = subTitles[(new Date().getTime()) % 3];
    //         course.level = levels[Math.ceil(Math.random() * 100) % 4];
    //         course.language = languages[Math.ceil(Math.random() * 100) % 2];
    //         course.category = category[Math.ceil(Math.random() * 100) % 2];
    //         course.area = '5ed8651e260ae02af256da15';
    //         course.avatar = avatars[Math.ceil(Math.random() * 100) % 4];
    //         course.price = `tier${Math.ceil(Math.random() * 100) % 3 + 1}`;
    //         course.save();
    //     })
    // }

    async fetch(teacherId: string, sort: Sort, page: number, limit: number): Promise<{ total: number, list: Array<any> }> {

        let authors: Array<any>;
        if (sort === Sort.Newest || sort === Sort.Oldest) {
            authors = await this.authorService.fetchWithTimeSortType(teacherId, sort);
        } else {
            authors = await this.authorService.fetchWithoutTimeSortType(teacherId);
            authors = _.orderBy(
                authors,
                ['course.title', 'createdAt'],
                [(sort === Sort.AtoZ) ? 'asc' : 'desc', 'desc']
            );
        }
        const total: number = _.size(authors);
        authors = _.slice(
            authors,
            (page - 1) * limit,
            page * limit
        );
        const courses = _.map(authors, item => {
            const course = item.course;
            const progress: number =
                +(course.progress.goals * ProgressBase.Goals)
                + (course.progress.syllabus * ProgressBase.Syllabus)
                + (course.progress.landing * ProgressBase.Landing)
                + (course.progress.price * ProgressBase.Price)
                + (course.progress.messages * ProgressBase.Messages)
            course.progress = progress;
            return course;
        });
        return {
            total,
            list: courses
        };
    }

    async validateCourse(courseId: string): Promise<boolean> {
        const course: ICourse = await this.courseModel
            .findById(courseId);
        return !!course;
    }

    async fetchInfo(courseId: string): Promise<any> {
        let info: any = await this.courseModel
            .findById(courseId)
            .select('title privacy progress')
            .lean()
            .exec();
        if (info) {
            let completeStatus = {};
            _.forEach(_.keys(info.progress), key => {
                completeStatus = {
                    ...completeStatus,
                    [key]: info.progress[key] === 100
                }
            });
            info = _.omit(info, ['progress']);
            const chapters = await this.chapterService.fetchChapters(courseId);
            return {
                ...info,
                completeStatus,
                syllabus: chapters
            };
        }
        return null;
    }

    async fetchGoals(courseId: string): Promise<any> {
        return await this.courseModel
            .findById(courseId)
            .select({
                whatLearns: 1,
                requirements: 1,
                targetStudents: 1,
                _id: 0
            })
            .populate('whatLearns.owner requirements.owner targetStudents.owner', 'name avatar');
    }

    async finalGoals(course: ICourse, field: GoalFields): Promise<{ progress: number, data: IGoals[] }> {
        let count: number = 0;
        if (!_.isEmpty(course.whatLearns)) count++;
        if (!_.isEmpty(course.requirements)) count++;
        if (!_.isEmpty(course.targetStudents)) count++;
        course.progress.goals = (count * 100) / 3;
        await course.save();
        return {
            progress: (count * 100) / 3,
            data: course[field]
        };
    }

    async updateWhatLearns(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: IWhatLearn[] }> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addWhatLearns = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.whatLearns = _.concat(
                _.map(
                    _.filter(
                        course.whatLearns,
                        (item: IWhatLearn) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: IWhatLearn) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addWhatLearns as IWhatLearn[]
            );
            await course.save();
            course = await this.courseModel.findById(courseId).populate('whatLearns.owner', 'name avatar');
            return await this.finalGoals(course, 'whatLearns');
        }
        return null;

        // const course = await this.courseModel
        //         .findByIdAndUpdate(courseId, {

        //             $push: {
        //                 whatLearns: {
        //                     $each: (addWhatLearns as IWhatLearn[])
        //                 }
        //             }
        //         }, {
        //             new: true,
        //             runValidators: true
        //         });
        // return course ? course.whatLearns : null;
    }

    async updateRequirements(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: IRequirement[] }> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addRequirements = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.requirements = _.concat(
                _.map(
                    _.filter(
                        course.requirements,
                        (item: IRequirement) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: IRequirement) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addRequirements as IRequirement[]
            );
            await course.save();
            course = await this.courseModel.findById(courseId).populate('requirements.owner', 'name avatar');
            return await this.finalGoals(course, 'requirements');
        }
        return null;
    }

    async updateTargetStudents(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: ITargetStudent[] }> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addTargetStudents = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.targetStudents = _.concat(
                _.map(
                    _.filter(
                        course.targetStudents,
                        (item: ITargetStudent) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: ITargetStudent) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addTargetStudents as ITargetStudent[]
            );
            await course.save();
            course = await this.courseModel.findById(courseId).populate('targetStudents.owner', 'name avatar');
            return await this.finalGoals(course, 'targetStudents');
        }
        return null;
    }

    async saveSyllabusProgress(courseId: string, progress: number): Promise<void> {
        await this.courseModel
            .updateOne({ _id: courseId }, {
                $set: {
                    'progress.syllabus': progress
                }
            });
    }

    async createChapter(teacherId: string, courseId: string, title: string, description: string): Promise<{ progress: number, data: IChapter }> {
        const data: { progress: number, data: IChapter } = await this.chapterService.create(teacherId, courseId, title, description);
        await this.saveSyllabusProgress(courseId, data.progress);
        return data;
    }

    async deleteChapter(courseId: string, chapterId: string): Promise<{ status: boolean, data: { progress: number, data: string } }> {
        const data: { status: boolean, progress: number } = await this.chapterService.delete(courseId, chapterId);
        if (!data.status) return { status: false, data: null };
        await this.saveSyllabusProgress(courseId, data.progress);
        return {
            status: true,
            data: {
                progress: data.progress,
                data: 'OK'
            }
        }
    }

    async createLecture(
        teacherId: string,
        courseId: string,
        chapterId: string,
        title: string,
        type: Lecture
    ): Promise<{ status: boolean, data: ILecture }> {
        const data: {
            status: boolean,
            data: ILecture
        } = await this.chapterService.createLecture(teacherId, courseId, chapterId, title, type);
        if (data.status) await this.saveSyllabusProgress(courseId, 100);
        return data;
    }

    async deleteLecture(
        courseId: string,
        chapterId: string,
        lectureId: string
    ): Promise<{ status: boolean, data: { progress: number, data: string } }> {
        const { status, progress } = await this.chapterService.deleteLecture(courseId, chapterId, lectureId);
        if (!status) return { status, data: null };
        await this.saveSyllabusProgress(courseId, progress);
        return {
            status,
            data: {
                progress,
                data: 'ok'
            }
        };
    }

    async fetchLanding(courseId: string): Promise<any> {
        const landing = await this.courseModel
            .findById(courseId)
            .select({
                title: 1,
                subTitle: 1,
                description: 1,
                language: 1,
                level: 1,
                area: 1,
                category: 1,
                primaryTopic: 1,
                topics: 1,
                avatar: 1
            })
            .populate('topics');
        if (landing) {
            //find topic for courseId
        }
        return landing;
    }

    async finalLanding(course: ICourse, fields: Array<string>): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        let count: number = 0;
        if (course.title) count++;
        if (course.subTitle) count++;
        if (course.description) count++;
        if (course.language) count++;
        if (course.level) count++;
        if (course.area) count++;
        if (course.category) count++;
        if (!_.isEmpty(course.topics)) count++;
        if (course.primaryTopic) count++;
        if (course.avatar) count++;
        course.progress.landing = count * 10;
        const final = await course.save();
        return {
            status: true,
            data: {
                progress: count * 10,
                data: _.pick(final, fields)
            }
        }
    }

    async updateLanding(courseId: string, params: UpdateLandingDto): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: params as ICourse
            }, {
                new: true,
                runValidators: true
            })
            .populate('topics');
        const properties: any = {};
        if (params.area) {
            properties.area = [params.area.toString()];
        }
        if (params.category) {
            properties.category = [params.category.toString()];
        }
        await recommendNetwork.inputCourseData(courseId.toString(), properties);
        if (!course) return { status: false, data: null };
        return await this.finalLanding(course, ['title', 'subTitle', 'description', 'language', 'level', 'area', 'category', 'topics', 'primaryTopic']);
    }

    async updateAvatar(courseId: string, url: string): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: {
                    avatar: url
                }
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        return await this.finalLanding(course, ['avatar']);
    }

    async fetchPrice(courseId: string): Promise<Price | false> {
        const course: ICourse = await this.courseModel
            .findById(courseId);
        return course ? course.price : false;
    }

    async updatePrice(courseId: string, price: Price): Promise<{ status: boolean, data: { progress: number, data: Price } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                price
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        const progress: number = course.price ? 100 : 0;
        course.progress.price = progress;
        await course.save();
        return {
            status: true,
            data: {
                progress,
                data: course.price
            }
        }
    }

    async fetchMessages(courseId: string): Promise<any> {
        const course: ICourse = await this.courseModel
            .findById(courseId);
        return course ? course.messages : null;
    }

    async updateMessages(courseId: string, welcome: string, congratulation: string): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: {
                    messages: {
                        welcome,
                        congratulation
                    }
                }
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        let count: number = 0;
        if (course.messages.welcome) count++;
        if (course.messages.congratulation) count++;
        course.progress.messages = (count * 100) / 2;
        await course.save();
        return {
            status: true,
            data: {
                progress: (count * 100) / 2,
                data: course.messages
            }
        }
    }

    async updatePrivacy(courseId: string, privacy: Privacy, password: string): Promise<{ status: Boolean }> {
        if (privacy !== Privacy.Password)
            password = null;
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                privacy,
                password
            }, {
                new: true,
                runValidators: true
            })
        if (!course)
            return { status: false };
        return { status: true }
    }

    async getCourseName(courseId: string): Promise<String> {
        const course = await this.courseModel
            .findById(courseId)
        return course.title;
    }

    async deleteAuthor(memberId: string, courseId: string) {
        const author = await this.authorService
            .deleteById(memberId);
        if (!author) return false;
        const teacherId: string = author.teacher;
        await this.teacherService.removeCourse(teacherId, courseId);
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $pull: {
                    authors: teacherId
                }
            }, {
                runValidators: true
            });
        return true;
    }

    async fetchCourseOverview(courseId: string): Promise<Object> {
        const overview = this.courseModel
            .findById(courseId)
            .select({
                '_id': 0,
                'whatLearns._id': 1,
                'whatLearns.content': 1,
                'requirements._id': 1,
                'requirements.content': 1,
                'targetStudents._id': 1,
                'targetStudents.content': 1,
                'description': 1
            })
            .lean()
            .exec()
        if (!overview)
            return null;
        return overview;
    }

    async fetchInstructors(courseId: string) {
        const teachers = await this.authorService.fetchAuthorsByCourseId(courseId);
        return teachers;
    }

    async fetchInfoForUser(courseId: string): Promise<any> {
        return null;
    }

    async fetchOverview(courseId: string): Promise<any> {
        const course = await this.courseModel
            .findById(courseId)
            .select({
                subTitle: 1,
                starRating: 1,
                numOfStudents: 1,
                language: 1,
                level: 1,
                description: 1,
                'whatLearns.content': 1,
                'requirements.content': 1,
                'targetStudents.content': 1
            })
            .lean()
            .exec();
        if (!course) return null;
        const courseLecturesInfo: {
            totalTime: number,
            numOfLectures: number
        } = await this.chapterService.fetchLecturesInfo(courseId);
        const whatLearnsData: string[] = _.map(course.whatLearns, 'content');
        const requirementsData: string[] = _.map(course.requirements, 'content');
        const targetStudentsData: string[] = _.map(course.targetStudents, 'content');
        return {
            ...course,
            ...courseLecturesInfo,
            whatLearns: whatLearnsData,
            requirements: requirementsData,
            targetStudents: targetStudentsData
        };
    }

    async fetchReviewInstructor(courseId: string, userId: string): Promise<any> {
        const teachersInfo = await this.authorService
            .fetchAuthorsByCourseId(courseId);
        const teacherIds = _.map(teachersInfo, '_id');
        const reviews = await this.reviewTeacherService
            .fetchReview(userId, teacherIds) as any;
        const teachersInfoData = _.keyBy(teachersInfo, '_id');
        const reviewsData = _.keyBy(reviews, 'teacher');
        return _.map(teacherIds, teacherId => {
            const finalReview = {
                starRating: 3.5,
                ratingContent: ''
            };
            if (reviewsData[teacherId]) {
                finalReview.ratingContent = reviewsData[teacherId].rating.comment || '';
                finalReview.starRating = reviewsData[teacherId].rating.value || 3.5;
            }

            return {
                ..._.pick(teachersInfoData[teacherId], ['_id', 'name', 'avatar', 'numOfCourses', 'numOfStudents']),
                ...finalReview
            };
        });
    }

    async fetchCourseTitleById(courseId: string): Promise<string> {
        const course = await this.courseModel.findById(courseId);
        return course.title;
    }

    async addAuthor(courseId: string, teacherId: string): Promise<void> {
        await this.courseModel.updateOne({
            _id: courseId
        }, {
            $push: {
                authors: teacherId
            }
        });
    }

    async fetchPublicInfo(courseId: string, user: { _id: string, role: Role }): Promise<any> {
        const course = await this.courseModel
            .findById(courseId)
            .populate('primaryTopic')
            .populate('area', 'title')
            .populate('authors', 'name')
            .select('-whatLearns -requirements -targetStudents -lastUpdated -category -topics -description -privacy -password -progress -messages -createdAt')
            .lean()
            .exec();
        if (!course) return null;
        const numOfRatings: number = await this.reviewCourseService.countNumRatings(courseId);
        let checkRegistered: boolean = false;
        if (user && user.role === Role.User)
            checkRegistered = await this.studentService.validateUserCourse(user._id, courseId);
        return {
            ...course,
            numOfRatings,
            isRegistered: checkRegistered,
            refundable: false,                          //TODO: Refund
            realPrice: course.price                     //TODO: discount
        };
    }

    async fetchInfosForCart(items: Array<any>): Promise<Array<any>> {
        const courseItemIds = _.map(_.filter(items, item => item.type === 'course'), '_id');
        let courseInfos = await this.courseModel
            .find({
                _id: {
                    $in: courseItemIds
                }
            })
            .populate('authors', 'name')
            .select('title avatar price authors')
            .lean()
            .exec();
        //TODO: bundle
        courseInfos = _.map(courseInfos, courseInfo => ({
            ...courseInfo,
            type: 'course',
            realPrice: courseInfo.price
        }));
        return courseInfos;
    }

    async buyItems(userId: string, items: Array<any>): Promise<void> {
        let totalPrice: number = 0;
        const courseItemIds = _.map(_.filter(items, item => item.type === 'course'), '_id');
        const coursePrice: number = _.sum(_.map(_.map(
            await this.courseModel
                .find({
                    _id: {
                        $in: courseItemIds
                    }
                })
                .lean()
                .exec(),
            'price'
        ), price => mapKeyToPrice(price)));
        totalPrice += coursePrice;
        await Promise.all([
            this.courseModel
              .updateMany({
                  _id: {
                      $in: courseItemIds
                  }
              }, {
                  $inc: {
                      numOfStudents: 1
                  }
              }),
            this.studentService.createMany(userId, courseItemIds),
            this.purchaseHistoryService.createOne(userId, items, totalPrice),
            ...courseItemIds.map(courseId => { return recommendNetwork.inputBuyEvent(userId.toString(), courseId.toString()); })
        ]);

    }

    async recommendCoursesForFriends(userId: string, courseId: string, friendIds: string[]): Promise<number> {
        const courseInfo = await this.courseModel.findById(courseId).select('title');
        if (!courseInfo) return -1;
        return await this.userService.sendNotificationRecommendCourse(userId, courseInfo, friendIds);
    }

    async findNameByListId(listIds: [string]): Promise<ICourse[]> {
        const names = await this.courseModel
            .find({
                _id: {
                    $in: listIds
                }
            })
            .select('title numOfStudents starRating')
            .exec()
        return names
    }

    async fetchInfoByLearner(userId: string, courseId: string): Promise<any> {
        const courseInfo: any = await this.courseModel
            .findById(courseId)
            .populate('authors', 'name')
            .select('title authors')
            .lean()
            .exec();
        if (!courseInfo) return null;
        courseInfo.authors = _.map(courseInfo.authors, 'name');
        const chapters = await this.chapterService.fetchChaptersWithDuration(userId, courseId);
        courseInfo.syllabus = chapters;
        return courseInfo;
    }

    async getAllCourseIds(): Promise<string[]> {
        const result = await this.courseModel.find().lean().exec();
        return _.map(result, '_id');
    }

    async updateStarRatings(bulkUpdateOps) {
        await this.courseModel.collection.bulkWrite(bulkUpdateOps, (err, result) => {
            console.log(err);
            console.log(result);
        })
    }

    async searchCourse(query: string, page: number, pageSize: number): Promise<any> {
        return new Promise((resolve, reject) => {
            (this.courseModel as any).search(
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
                    let result = results.hits.hits.map(course => {
                        const { title, subTitle, authors, updatedAt, avatar, numOfStudents, area, price, starRating, language, level, whatLearns } = course;
                        const returnCourse = {
                            _id: course._id,
                            title,
                            subTitle,
                            authors,
                            updatedAt,
                            avatar,
                            numOfStudents,
                            area,
                            starRating,
                            language: mapKeyToLanguage(language),
                            level: mapKeyToLevel(level),
                            price: mapKeyToPrice(price),
                            whatLearns
                        };
                        return returnCourse;
                    })
                    const areaIds = _.map(result, 'area');
                    const areaNamesMap = await this.areaService.findNamesMapFromListId(areaIds);
                    const authorIds = [];
                    const authorIdsHashMap: any = {};
                    result.forEach(course => {
                        //@ts-ignore
                        course.authors.forEach(authorId => {
                            if (!authorIdsHashMap[authorId]) {
                                authorIdsHashMap[authorId] = true;
                                authorIds.push(authorId);
                            }
                        })
                    });
                    const authorNamesHashmap = await this.teacherService.findNamesMapFromListId(authorIds);
                    result = _.map(result, course => ({
                        ...course,
                        area: areaNamesMap[course.area],
                        authors: _.map(course.authors, authorId => authorNamesHashmap[authorId])
                    }));
                    const respond = {
                        total: results.hits.total,
                        list: result
                    }
                    resolve(respond);
                })
        })
    }

    convertIdToElasticData = async (listIds) => {
        for (let i = 0; i < listIds.length; i++) {
            const teacher: ITeacher = await this.teacherService.findTeacherById(listIds[i]);
            listIds[i].name = teacher.name;
        }
        return listIds;
    }

    async handleSuggestData(data: Array<any>) {

        const courses = [];

        data.forEach(data => {
            courses.push({
                title: data['_source'].title,
                numOfStudents: data['_source'].numOfStudents,
                starRating: data['_source'].starRating,
                _id: data['_id']
            })
        })
        return courses;
    }

    async getSuggestions(keyword: string, response) {
        return new Promise((resolve, reject) => {
            (this.courseModel as any).search(null, {
                suggest: {
                    "course-suggest": {
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

                    const result = await this.handleSuggestData(
                        results.suggest['course-suggest'][0].options
                    )
                    Array.prototype.push.apply(response.courses, result);

                    resolve()

                })
        })
    }

    takeFiveCourseHighestScore(courses) {
        const sortCourses = courses.sort(compareByScore);
        const result = sortCourses.reduce((acc, current) => {
            const x = acc.find(item => item._id == current._id);

            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);
        return result.slice(0, 5);
    }

    async fullSuggest(keyword: string) {
        const response = {
            courses: [],
            topics: [],
            teachers: []
        };
        await Promise.all([
            this.getSuggestions(keyword, response),
            this.topicService.getTopicSuggest(keyword, response),
            this.teacherService.getTeacherSuggest(keyword, response)
        ])
        response.courses = this.takeFiveCourseHighestScore(response.courses);
        return response;
    }

    async fetchCoursesByAreaId(areaId: string, categoryId: string | null, query: any, categoriesObj): Promise<any> {
        const {
            page,
            pageSize,
            sortBy,             //highest-rated popularity newest lowest-price highest-price
            topics = '',
            categories = '',
            languages = '',
            ratings = '',
            levels = '',
            prices = ''
        } = query;
        const topicsArr = topics !== '' ? topics.split(',') : [];
        const languagesArr = languages !== '' ? languages.split(',') : [];
        const categoryArr = categories !== '' ? categories.split(',') : [];
        const ratingsArr = ratings !== '' ? ratings.split(',') : [];
        const levelsArr = levels !== '' ? levels.split(',') : []
        const pricesArr = prices !== '' ? prices.split(',') : [];
        return await this.searchCoursesForArea(areaId, categoryId, sortBy, {
            topicsArr,
            languagesArr,
            categoryArr,
            ratingsArr,
            levelsArr,
            pricesArr
        }, { page: parseInt(page), pageSize: parseInt(pageSize) }, categoriesObj);
    }

    async searchCoursesForArea(areaId, categoryId, sortBy, query, pagination, categoriesObj) {
        const filterObj: any = {
            area: areaId,
            //topics: { $all: query.topicsArr }
        };
        if (categoryId) {
            filterObj.category = categoryId;
        }
        if (query.topicsArr.length > 0) {
            query.topics = { $all: query.topicsArr };
        }
        if (query.languagesArr.length > 0) {
            filterObj.language = {
                $in: query.languagesArr
            };
        }
        if (query.categoryArr.length > 0) {
            filterObj.category = {
                $in: query.categoryArr
            };
        }
        if (query.ratingsArr.length > 0) {
            let compareArr = [];
            query.ratingsArr.forEach(item => {
                const [start, end] = _.map(item.split('-to-'), item => parseInt(item));
                const startCond = { $or: [{ $gt: start }, { $eq: start }] };
                const endCond = { $lt: end };
                const temp = { $and: [startCond, endCond] };
                compareArr.push(temp);
            })
            filterObj.starRating = {
                $or: compareArr
            };
        }
        if (query.pricesArr.length > 0) {
            filterObj.price = {
                $in: query.pricesArr
            };
        }
        if (query.levelsArr.length > 0) {
            filterObj.level = {
                $in: query.levelsArr
            };
        }
        if (query.pricesArr.length > 0) {
            filterObj.price = {
                $in: query.pricesArr
            };
        }
        let sort = '';
        if (sortBy === 'highest-rated') {
            sort = '-starRating';
        } else if (sortBy === 'popularity') {
            sort = '-numOfStudents';
        } else if (sortBy === 'newest') {
            sort = '-createdAt';
        }
        const data = await this.courseModel
            .find(filterObj)
            .sort(sort)
            .populate('topics', 'title')
            .populate('primaryTopic')
            .populate('authors', 'name')
            .populate('area', 'title')
            .select('title authors avatar updatedAt category area topics starRating numOfStudents subTitle level language whatLearns._id whatLearns.content price primaryTopic ')
            .lean()
            .exec();
        const total = data.length;
        let filterResult = {
            topics: {
                select: query.topicsArr,
                list: {}
            },
            languages: {
                select: query.languagesArr,
                list: {}
            },
            categories: {
                select: query.categoryArr,
                list: {}
            },
            levels: {
                select: query.levelsArr,
                list: {}
            },
            prices: {
                select: query.pricesArr,
                list: {}
            },
            ratings: {
                select: query.ratingsArr,
                list: {}
            }
        };
        data.forEach(item => {
            //prices
            if (item.price !== null) {
                if (!filterResult.prices.list[item.price]) {
                    filterResult.prices.list[item.price] = {
                        key: item.price,
                        title: `$${mapKeyToPrice(item.price)}`,
                        count: 1
                    }
                } else {
                    filterResult.prices.list[item.price].count += 1;
                }
            }
            //levels
            if (item.level !== null) {
                if (!filterResult.levels.list[item.level]) {
                    filterResult.levels.list[item.level] = {
                        key: item.level,
                        title: mapKeyToLevel(item.level),
                        count: 1
                    }
                } else {
                    filterResult.levels.list[item.level].count += 1;
                }
            }
            //languages
            if (item.language !== null) {
                if (!filterResult.languages.list[item.language]) {
                    filterResult.languages.list[item.language] = {
                        key: item.language,
                        title: mapKeyToLanguage(item.language),
                        count: 1
                    }
                } else {
                    filterResult.languages.list[item.language].count += 1;
                }
            }
            //categories

            if (item.category !== null) {
                const cateId = item.category;
                const cateStr = categoriesObj[cateId];
                if (!filterResult.categories.list[cateId]) {
                    filterResult.categories.list[cateId] = {
                        key: cateId,
                        title: cateStr,
                        count: 1
                    }
                } else {
                    filterResult.categories.list[cateId].count += 1;
                }
            }
            //star ratings
            if (item.starRating !== null) {
                const { rangeKey, rangeStr } = mapStarValueToStarRangeObj(item.starRating);
                if (!filterResult.ratings.list[rangeKey]) {
                    filterResult.ratings.list[rangeKey] = {
                        key: rangeKey,
                        title: rangeStr,
                        star: _.floor(item.starRating),
                        count: 1
                    }
                } else {
                    filterResult.ratings.list[rangeKey].count += 1;
                }
            }
            //topics
            item.topics.forEach(topic => {
                //@ts-ignore
                const topicId = topic._id;
                //@ts-ignore
                const topicStr = topic.title;
                if (!filterResult.topics.list[topicId]) {
                    filterResult.topics.list[topicId] = {
                        key: topicId,
                        title: topicStr,
                        count: 1
                    }
                } else {
                    filterResult.topics.list[topicId].count += 1;
                }
            })
        })
        const filterResultKeys = _.keys(filterResult);
        filterResultKeys.forEach(key => {
            filterResult[key].list = _.toArray(filterResult[key].list)
        });
        const { page, pageSize } = pagination;
        let dataResult: any = _.slice(data, (page - 1) * pageSize, page * pageSize);
        dataResult = _.map(dataResult, dataItem => ({
            ...dataItem,
            primaryTopic: (dataItem.primaryTopic && dataItem.primaryTopic.title) || 'C++',
            area: dataItem.area.title,
            category: categoriesObj[dataItem.category] || 'React',
            level: mapKeyToLevel(dataItem.level),
            language: mapKeyToLanguage(dataItem.language),
            authors: _.map(dataItem.authors, 'name'),
            price: mapKeyToPrice(dataItem.price),
            realPrice: 29.99
        }))
        return {
            total,
            list: dataResult,
            filters: filterResult,
            sortBy
        }
    }

    async createMostPopularCourses(minNumStudents: number, minStarRating: number): Promise<Array<any>> {
        const data = await this.courseModel.find({
            numOfStudents: {
                $gt: minNumStudents
            },
            starRating: {
                $gt: minStarRating
            }
        })
          .lean()
          .exec();
        return data;
    }

    async createHighRatingCourses(minNumStudents: number, minStarRating: number): Promise<Array<any>> {
        const data = await this.courseModel.find({
            numOfStudents: {
                $gt: minNumStudents
            },
            starRating: {
                $gt: minStarRating
            }
        })
          .lean()
          .exec();
        return data;
    }

    async fetchRecommendCoursesForAuthorizedUser(user: { _id: string, role: Role }): Promise<any> {
        const userId: string = user._id.toString();
        const interestedCategories = await this.userService.fetchInterestedCategories(userId);
        let randomInterestedCategories = [];
        if (interestedCategories.length > 0) {
            randomInterestedCategories = randomFromArray(interestedCategories, 4);
            randomInterestedCategories = await this.areaService.getFullInfoCategories(randomInterestedCategories);
        }
        else {
            randomInterestedCategories = await this.areaService.fetchRandomCategories();
        }
        const businessRuleQueries = this.createBusinessRuleQueriesFromCategoriesList(randomInterestedCategories.map(category => category._id));
        const rawResults = await Promise.all([
            recommendNetwork.fetchNonPersonalizedRecommend(),
            recommendNetwork.fetchPersonalizedRecommend(userId),
            ...businessRuleQueries.map(rules => {
                return recommendNetwork.fetchBusinessRulesRecommendForUser('0', rules)
            })
        ]);
        const courseIds = _.map(_.flatten(rawResults), item => item.item);
        const courseInfoMap = await this.getCourseInfoMap(courseIds);
        const [nonPersonalizedResult, personalizedResult, ...interestedCategoriesResults] = rawResults;
        const result = {
            categories: {}
        };
        if (nonPersonalizedResult.length > 0) {
            result['nonPersonalized'] = {
                starRatings: [],
                mostPopular: nonPersonalizedResult.map(course => courseInfoMap[course.item])
            }
        }
        if (personalizedResult.length > 0) {
            result['personalized'] = personalizedResult.map(course => courseInfoMap[course.item]);
        }
        randomInterestedCategories.forEach((category, index) => {
            const list = interestedCategoriesResults[index];
            if (list.length > 0) {
                result['categories'][category._id] = {
                    _id: category._id,
                    title: category.title,
                    list: list.map(course => courseInfoMap[course.item])
                };
            }
        });
        return result;
    }

    async getCourseInfoMap(courseIds: string[]): Promise<any> {
        const courses = await this.courseModel
          .find({
            _id: {
                $in: courseIds
            }
          })
          .populate('topics', 'title')
          .populate('primaryTopic')
          .populate('authors', 'name')
          .populate('area', 'title')
          .select('title authors avatar updatedAt category area topics starRating numOfStudents subTitle level language whatLearns._id whatLearns.content price primaryTopic ')
          .lean()
          .exec()
        const courseArr = courses.map(courseItem => ({
            ...courseItem,
            //@ts-ignore
            primaryTopic: (courseItem.primaryTopic && courseItem.primaryTopic.title) || 'C++',
            //@ts-ignore
            area: courseItem.area && courseItem.area.title,
            level: mapKeyToLevel(courseItem.level),
            language: mapKeyToLanguage(courseItem.language),
            authors: _.map(courseItem.authors, 'name'),
            price: mapKeyToPrice(courseItem.price),
            realPrice: 29.99,
            lastUpdated: courseItem.updatedAt
        }));
        return _.keyBy(courseArr, '_id');
    }

    async fetchRecommendCoursesForUnauthorizedUser(): Promise<any> {
        const randomCategories = await this.areaService.fetchRandomCategories();
        const businessRuleQueries = this.createBusinessRuleQueriesFromCategoriesList(randomCategories.map(category => category._id));
        const rawResults = await Promise.all([
          recommendNetwork.fetchNonPersonalizedRecommend(),
          ...businessRuleQueries.map(rules => {
              return recommendNetwork.fetchBusinessRulesRecommendForUser('0', rules)
          })
        ]);
        const courseIds = _.map(_.flatten(rawResults), item => item.item);
        const courseInfoMap = await this.getCourseInfoMap(courseIds);
        const [nonPersonalizedResult, ...interestedCategoriesResults] = rawResults;
        const result = {
            categories: {}
        };
        if (nonPersonalizedResult.length > 0) {
            result['nonPersonalized'] = {
                starRatings: [],
                mostPopular: nonPersonalizedResult.map(course => courseInfoMap[course.item])
            }
        }
        randomCategories.forEach((category, index) => {
            const list = interestedCategoriesResults[index];
            if (list.length > 0) {
                result['categories'][category._id] = {
                    _id: category._id,
                    title: category.title,
                    list: list.map(course => courseInfoMap[course.item])
                };
            }
        });
        return result;
    }

    createBusinessRuleQueriesFromCategoriesList(categories: string[]): Array<any> {
        return categories.map(category => {
            return [
                {
                    name: 'category',
                    values: [category.toString()],
                    bias: -1
                }
            ];
        });
    }

    async fetchRecommendCoursesOfArea(user: { _id: string, role: Role }, areaId: string): Promise<any> {
        const rules = [
            {
                name: 'area',
                values: [areaId.toString()],
                bias: -1
            }
        ];
        const nonPersonalizedResult = await recommendNetwork.fetchBusinessRulesRecommendForUser('0', rules);
        const courseIds = _.map(nonPersonalizedResult, item => item.item);
        const courseInfoMap = await this.getCourseInfoMap(courseIds);
        const result = {};
        result['nonPersonalized'] = {
            starRatings: [],
            mostPopular: nonPersonalizedResult.map(course => courseInfoMap[course.item])
        }
        return result;
    }

    async fetchRecommendCoursesOfCategory(user: { _id: string, role: Role }, categoryId: string): Promise<any> {
        const rules = [
            {
                name: 'category',
                values: [categoryId.toString()],
                bias: -1
            }
        ];
        const nonPersonalizedResult = await recommendNetwork.fetchBusinessRulesRecommendForUser('0', rules);
        const courseIds = _.map(nonPersonalizedResult, item => item.item);
        const courseInfoMap = await this.getCourseInfoMap(courseIds);
        const result = {};
        result['nonPersonalized'] = {
            starRatings: [],
            mostPopular: nonPersonalizedResult.map(course => courseInfoMap[course.item])
        }
        return result;
    }

    async fetchRelatedCourses(courseId: string): Promise<any> {
        const [
          alsoBoughtResult,
          sameAuthorResult
        ] = await Promise.all([
          recommendNetwork.fetchItemBaseRecommend(courseId.toString()),
          this.fetchSameAuthorCourses(courseId)
        ]);
        const alsoBoughtCourseIds = alsoBoughtResult.map(course => course.item);
        const courseInfoMap = await this.getCourseInfoMapForAlsoBought(alsoBoughtCourseIds);
        return {
            alsoBought: alsoBoughtCourseIds.map(courseId => courseInfoMap[courseId]),
            sameAuthors: sameAuthorResult,
            frequent: {}
        };
    }

    async getCourseInfoMapForAlsoBought(courseIds: string[]): Promise<any> {
        const [courses, numOfLectureMap] = await Promise.all([
            this.courseModel
              .find({
                  _id: {
                      $in: courseIds
                  }
              })
              .populate('authors', 'name')
              .select('title authors avatar updatedAt starRating numOfStudents price')
              .lean()
              .exec(),
            this.chapterService.getNumOfLectureMap(courseIds)
        ]);
        const courseArr = courses.map(courseItem => ({
            ...courseItem,
            authors: _.map(courseItem.authors, 'name'),
            price: mapKeyToPrice(courseItem.price),
            realPrice: 29.99,
            lastUpdated: courseItem.updatedAt,
            numOfLectures: numOfLectureMap[courseItem._id] || 0
        }));
        return _.keyBy(courseArr, '_id');
    }

    async fetchSameAuthorCourses(courseId: string): Promise<Array<any>> {
        const course = await this.courseModel.findById(courseId).lean().exec();
        const authorIds = course.authors;
        const courseIds = await this.authorService.fetchSampleCoursesByAuthors(courseId, authorIds);
        const courseInfoMap = await this.getCourseInfoMap(courseIds);
        return courseIds.map(courseId => courseInfoMap[courseId]);
    }

    async submitView(userId: string, courseId: string): Promise<any> {
        await recommendNetwork.inputViewEvent(userId.toString(), courseId.toString());
    }
}