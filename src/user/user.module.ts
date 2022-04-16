// ========== User Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ValidationPipe } from '../validation.pipe';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		UserService,
	],
	controllers: [UserController],
})
export class UserModule {}
