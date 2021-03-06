// ========= Voice Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from 'src/user/users.providers';
import { ValidationPipe } from '../validation.pipe';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { voicesProviders } from './voices.providers';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		VoiceService,
		...usersProviders,
		...voicesProviders,
	],
	controllers: [VoiceController],
})
export class VoiceModule {}
