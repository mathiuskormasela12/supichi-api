// ========== User Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { ValidationPipe } from '../validation.pipe';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { usersProviders } from './users.providers';

@Module({
	imports: [JwtModule.register({}), DatabaseModule],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		UserService,
		...usersProviders,
	],
	controllers: [UserController],
})
export class UserModule {}
