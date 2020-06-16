import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema } from './schemas/question.schema';
import { AnswerSchema } from './schemas/answer.schema';
import { StudentModule } from '@/student/student.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Question', schema: QuestionSchema },
			{ name: 'Answer', schema: AnswerSchema }
		]),
		StudentModule
	],
	controllers: [QuestionController],
	providers: [QuestionService]
})
export class QuestionModule {}
