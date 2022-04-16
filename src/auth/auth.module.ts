// ========= Auth Module
// import all modules

import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ValidationPipe } from '../validation.pipe';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		AuthService,
	],
	controllers: [AuthController],
})
export class AuthModule {}
