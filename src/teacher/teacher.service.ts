import { Injectable, Inject, HttpStatus, ConflictException, BadRequestException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { UpdateSocialsDto } from './dtos/socials.dto';
import { UpdateDto } from './dtos/update.dto';
import { ITeacher } from './interfaces/teacher.interface';
import { Role, Notification, Push } from '@/config/constants';
import { AuthorService } from '@/author/author.service';
import { UserService } from '@/user/user.service';
import { INotification } from './interfaces/notification.interface';
import { MessagingService } from '@/firebase/messaging.service';
import { CourseService } from '@/course/course.service';

@Injectable()
export class TeacherService {
    constructor(
        @InjectModel('Teacher') private readonly teacherModel: Model<ITeacher>,
        @InjectModel('TeacherNotification') private readonly notificationModel: Model<INotification>,
        private readonly authorService: AuthorService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly messagingService: MessagingService,
        @Inject(forwardRef(() => CourseService)) private courseService: CourseService
    ) {
        (this.teacherModel as any).createMapping(function (err, mapping) {
            if (err) {
                //console.log('error creating mapping (you can safely ignore this)');
                //console.log(err);
            } else {
                console.log('mapping created!');
                console.log(mapping);
            }
        });
        (this.teacherModel as any).esTruncate(function (err) {
            let stream = (teacherModel as any).synchronize();
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

    async create(body): Promise<ITeacher> {
        const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
        body.password = await bcrypt.hash(body.password, saltRounds);

        let teacher: ITeacher = new this.teacherModel({
            ...body,
            suggest: body.name.split(" ")
        });

        teacher.suggest.push(body.name)


        teacher = await teacher.save();

        let _teacher = teacher as ITeacher as any;
        _teacher.on("es-indexed", (err, res) => {
            if (err) throw err;
        })

        return await teacher.save();
    }

    async addCourse(teacherId: string, courseId: string): Promise<void> {
        await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                $push: {
                    courses: courseId
                }
            }, {
                runValidators: true
            });
    }

    async findTeacherByPhone(phone: string): Promise<any> {
        const teacher: any = await this.teacherModel
            .findOne({ phone })
            .select({
                followingStudents: 0
            })
            .lean()
            .exec();
        if (!teacher) return null;
        const noOfUsNotification: number = _.size(_.filter(teacher.notifications, notification => !notification.seen));
        return {
            ..._.omit(teacher, ['notifications']),
            noOfUsNotification
        };
    }

    async findTeacherById(teacherId: string): Promise<any> {
        const teacher: any = await this.teacherModel
            .findById(teacherId)
            .select({
                followingStudents: 0,
                password: 0
            })
            .lean()
            .exec();
        if (!teacher) return null;
        const noOfUsNotification: number = _.size(_.filter(teacher.notifications, notification => !notification.seen));
        return {
            ..._.omit(teacher, ['notifications']),
            noOfUsNotification
        };
    }

    async findTeacherByEmail(email: string): Promise<ITeacher> {
        const teacher = await this.teacherModel
            .findOne({ email })
        return teacher;
    }

    async fetchIdAvatarNameById(teacherId: string): Promise<ITeacher> {
        const teacher: any = await this.teacherModel
            .findById(teacherId)
            .select({
                _id: 1,
                avatar: 1,
                name: 1
            })
            .lean()
            .exec();
        return teacher;
    }

    async update(teacherId: string, params: UpdateDto): Promise<any> {
        try {
            const teacher = await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    ...params
                }, {
                    new: true,
                    runValidators: true
                })
                .select('phone name email biography headline');
            return teacher;
        }
        catch (e) {
            if (e.name === 'MongoError' && e.codeName === 'DuplicateKey')
                throw new ConflictException(e.errmsg);
            else if (e.name === 'ValidationError')
                throw new BadRequestException(e.message);
            throw e;
        }
    }

    async updateSocials(teacherId: string, params: UpdateSocialsDto): Promise<any> {
        return await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                ...params
            }, {
                new: true,
                runValidators: true
            })
            .select('twitter facebook youtube instagram');
    }

    async updateAvatar(teacherId: string, avatar: string): Promise<any> {
        return await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                avatar
            }, {
                new: true
            })
            .select('avatar');
    }

    async updatePassword(teacherId: string, oldPassword: string, newPassword: string): Promise<0 | -1 | 1> {
        const teacher = await this.teacherModel.findById(teacherId);
        if (teacher) {
            const check: boolean = await bcrypt.compare(oldPassword, teacher.password);
            if (!check) return -1;
            const saltRounds: number = parseInt(this.configService.get<string>('SALT_ROUNDS'));
            const hashedPassword: string = await bcrypt.hash(newPassword, saltRounds);
            teacher.password = hashedPassword;
            await teacher.save();
            return 1;
        }
        return 0;
    }

    async fetchTeacher(userId: string, teacherId: string): Promise<any> {
        const teacher = await this.teacherModel
            .findById(teacherId, {
                followingStudents: {
                    $elemMatch: userId
                }
            })
            .select('name avatar biography twitter facebook youtube instagram followingStudents courses')
            .populate('courses', 'numOfStudents')
            .lean()
            .exec();
        if (teacher) {
            const isFollowed: boolean = !_.isEmpty(teacher.followingStudents);
            //count numOfStudents, numOfCourses, numOfReviews.
            const numOfCourses: number = _.size(teacher.courses);
            const numOfStudents: number = _.sum(_.map(teacher.courses, ['numOfStudents']));
            return {
                ..._.omit(teacher, ['followingStudents', 'courses']),
                isFollowed,
                numOfStudents,
                numOfCourses,
                numOfReviews: 12099
            };
        }
        return null;
    }

    async follow(userId: string, teacherId: string): Promise<0 | 1 | -1> {
        try {
            const teacher: ITeacher = await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    $push: {
                        followingStudents: userId
                    }
                }, {
                    runValidators: true
                });
            if (!teacher) return 0;
            const status: 1 | -1 = await this.userService.followTeacher(userId, teacherId);
            if (status === 1) {

            }
            //firebase;
            return status;
        }
        catch (e) {
            return -1;
        }
    }

    async unfollow(userId: string, teacherId: string): Promise<0 | 1 | -1> {
        try {
            const teacher: ITeacher = await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    $pull: {
                        followingStudents: userId
                    }
                });
            if (!teacher) return 0;
            return await this.userService.unfollowTeacher(userId, teacherId);
        }
        catch (e) {
            return -1;
        }
    }

    async updateNotification(teacherId: string, notification: any): Promise<{ status: Boolean }> {
        const teacher: ITeacher = await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                $push: {
                    notifications: notification
                }
            })
        if (!teacher)
            return { status: false };
        return { status: true };
    }

    async updateFCMToken(teacherId: string, token: string): Promise<any> {
        this.messagingService.sayHello(token);
        return await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                $set: {
                    fcmToken: token
                }
            }, {
                new: true,
                runValidators: true
            })
            .select('fcmToken -_id');
    }

    async invite(teacherId: string, courseId: string, courseTitle: string, email: string): Promise<boolean> {
        const notificationData = {
            type: Notification.Invite,
            owner: teacherId,
            ownerType: Role.Teacher,
            content: `đã mời bạn tham gia phát triển khoá học ${courseTitle}`,
            course: courseId
        };
        const notification: INotification = new this.notificationModel(notificationData);
        const teacher = await this.teacherModel
            .findOneAndUpdate({
                email
            }, {
                $push: {
                    notifications: {
                        $each: [notification],
                        $position: 0
                    }
                }
            });
        if (!teacher) return false;
        if (teacher.fcmToken) {
            const owner = await this.fetchIdAvatarNameById(teacherId);
            await this.messagingService.send(teacher.fcmToken, {
                notification: {
                    title: `Mời tham gia phát triển`,
                    body: `${owner.name} mời bạn tham gia phát triển khoá học ${courseTitle}.`
                },
                data: {
                    _id: notification._id.toString(),
                    createdAt: notification.createdAt.toString(),
                    ownerType: Role.Teacher,
                    ownerId: teacherId,
                    ownerName: owner.name,
                    ...(owner.avatar ? { ownerAvatar: owner.avatar } : {}),
                    pushType: Push.Notification,
                    type: Notification.Invite,
                    content: `đã mời bạn tham gia phát triển khoá học ${courseTitle}.`,
                }
            });
        }
        return true;
    }

    async fetchNotifications(teacherId: string, skip: number, limit: number): Promise<{ hasMore: boolean, list: INotification[] }> {
        const teacher = await this.teacherModel
            .findById(teacherId)
            .select('notifications')
            .populate('notifications.owner', 'name avatar')
            .lean()
            .exec();
        const hasMore: boolean = skip + limit < _.size(teacher.notifications);
        return {
            hasMore,
            list: _.slice(teacher.notifications, skip, skip + limit)
        };
    }

    async seen(teacherId: string, notificationId: string): Promise<boolean> {
        try {
            const teacher: ITeacher = await this.teacherModel.findById(teacherId);
            const index: number = _.indexOf(_.map(teacher.notifications, notification => notification._id.toString()), notificationId);
            if (index === -1) return false;
            teacher.notifications[index].seen = true;
            await teacher.save();
            return true;
        }
        catch (e) {
            return false;
        }
    }

    async allSeen(teacherId: string): Promise<void> {
        await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                $set: {
                    'notifications.$[].seen': true
                }
            }, {
                runValidators: true
            });
    }

    async fetchInvitation(teacherId: string, notificationId: string): Promise<{ status: -1 | 0 | 1, invitation: any }> {
        const teacher: ITeacher = await this.teacherModel
            .findById(teacherId, {
                notifications: {
                    $elemMatch: {
                        _id: notificationId
                    }
                }
            })
            .populate('notifications.owner', 'name avatar')
            .populate('notifications.course', 'title')
        if (!teacher || _.isEmpty(teacher.notifications)) {
            return { status: -1, invitation: null };
        }
        let notification: INotification = teacher.notifications[0];
        if (!notification.course || notification.type !== Notification.Invite)
            return { status: 0, invitation: null };
        return {
            status: 1,
            invitation: notification
        };
    }

    async acceptInvitation(teacherId: string, notificationId: string): Promise<number> {
        let teacher: ITeacher = await this.teacherModel
            .findById(teacherId, {
                notifications: {
                    $elemMatch: {
                        _id: notificationId
                    }
                }
            })
            .populate('notifications.course', 'title');
        if (!teacher || _.isEmpty(teacher.notifications)) return -1;
        let notification: INotification = teacher.notifications[0];
        if (!notification.course || notification.type !== Notification.Invite) return 0;
        const targetTeacherId: string = notification.owner;
        //@ts-ignore
        const { _id: courseId, title: courseTitle } = notification.course;

        //SEND NOTIFICATION TO TEACHER OWNER
        const notificationData = {
            type: Notification.AcceptInvitation,
            owner: teacherId,
            ownerType: Role.Teacher,
            content: `đã đồng ý tham gia phát triển khoá học ${courseTitle}`,
            course: courseId
        };
        const newNotification: INotification = new this.notificationModel(notificationData);
        const targetTeacher = await this.teacherModel
            .findByIdAndUpdate(targetTeacherId, {
                $push: {
                    notifications: {
                        $each: [newNotification],
                        $position: 0
                    }
                }
            });
        if (!targetTeacher) return -1;
        teacher = await this.fetchIdAvatarNameById(teacherId);
        if (targetTeacher.fcmToken) {
            await this.messagingService.send(targetTeacher.fcmToken, {
                notification: {
                    title: `Đồng ý tham gia phát triển khoá học`,
                    body: `${teacher.name} đã đồng ý tham gia phát triển khoá học ${courseTitle}.`
                },
                data: {
                    _id: newNotification._id.toString(),
                    createdAt: newNotification.createdAt.toString(),
                    ownerType: Role.Teacher,
                    ownerId: teacherId,
                    ownerName: teacher.name,
                    ...(teacher.avatar ? { ownerAvatar: teacher.avatar } : {}),
                    pushType: Push.Notification,
                    type: Notification.AcceptInvitation,
                    content: `đã đồng ý tham gia phát triển khoá học ${courseTitle}.`,
                }
            });
        }

        //UPDATE AUTHOR
        await this.teacherModel.updateOne({
            _id: teacherId
        }, {
            $push: {
                courses: courseId
            },
            $pull: {
                notifications: {
                    _id: notificationId
                }
            }
        });
        await this.courseService.addAuthor(courseId, teacherId);
        await this.authorService.create(teacherId, courseId, false);
        return 1;           //OK
    }

    async removeCourse(teacherId: string, courseId: string): Promise<void> {
        await this.teacherModel
            .updateOne({
                _id: teacherId
            }, {
                $pull: {
                    courses: courseId
                }
            });
    }

    async findNameByListId(listIds: [string]): Promise<ITeacher[]> {
        const names = await this.teacherModel
            .find({
                _id: {
                    $in: listIds
                }
            })
            .select('name')
            .exec()
        return names
    }

    async handleSuggestData(data: Array<Object>) {

        const response = {
            courses: [],
            authors: []
        };
        for (let i = 0; i < data.length; i++) {
            data[i]['_source'].courses = await this.courseService.findNameByListId(data[i]['_source'].courses);
        }

        data.forEach(data => {
            response.authors.push({
                name: data['_source'].name,
                _id: data['_id']
            }),
                response.courses = [].concat(data['_source'].courses)
        })
        return response;
    }
    async getTeacherSuggest(keyword: string, response) {
        return new Promise((resolve, reject) => {
            (this.teacherModel as any).search(null, {
                suggest: {
                    "teacher-suggest": {
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
                    const result = await this.handleSuggestData(results.suggest['teacher-suggest'][0].options);
                    response.teachers = result.authors;
                    Array.prototype.push.apply(response.courses, result.courses);

                    resolve();

                })
        })
    }

    async searchTeacher(query: string, page: number, pageSize: number): Promise<any> {
        return new Promise((resolve, reject) => {
            (this.teacherModel as any).search(
                {
                    "multi_match": {
                        "fields": ["name"],
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
                        const { name, avatar } = teacher;
                        const returnTeacher = {
                            _id: teacher._id,
                            name,
                            avatar,
                            numOfStudents: 0,
                            numOfCourses: 0
                        };
                        return returnTeacher;
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
