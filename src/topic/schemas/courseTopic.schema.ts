import { Schema } from 'mongoose';

export const CourseTopicSchema = new Schema({
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
});