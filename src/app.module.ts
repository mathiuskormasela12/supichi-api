import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import 'dotenv/config';
import { ResponseModule } from './response/response.module';
import { NodeMailerModule } from './nodemailer/nodemailer.module';
import { AuthModule } from './auth/auth.module';
import { TextModule } from './text/text.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { GttsModule } from './gtts/gtts.module';
import { VoiceModule } from './voice/voice.module';

const { EMAIL, EMAIL_PASSWORD, EMAIL_HOST } = process.env;
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../public'),
		}),
		MailerModule.forRoot({
			transport: `smtps://${EMAIL}:${EMAIL_PASSWORD}@${EMAIL_HOST}`,
		}),
		UserModule,
		AuthModule,
		UploadModule,
		TextModule,
		VoiceModule,
		NodeMailerModule,
		ResponseModule,
		GttsModule,
	],
})
export class AppModule {}
