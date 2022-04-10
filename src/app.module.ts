import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import 'dotenv/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

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
		AuthModule,
		PrismaModule,
	],
})
export class AppModule {}
