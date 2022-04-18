// ========= Text Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ValidationPipe } from '../validation.pipe';
import { TextController } from './text.controller';
import { TextService } from './text.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		TextService,
	],
	controllers: [TextController],
})
export class TextModule {}
