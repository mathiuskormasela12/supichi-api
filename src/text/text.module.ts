// ========= Text Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from 'src/user/users.providers';
import { ValidationPipe } from '../validation.pipe';
import { TextController } from './text.controller';
import { textsProviders } from './text.providers';
import { TextService } from './text.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		TextService,
		...usersProviders,
		...textsProviders,
	],
	controllers: [TextController],
})
export class TextModule {}
