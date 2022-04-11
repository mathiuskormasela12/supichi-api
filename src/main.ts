import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as compresion from 'compression';
import * as morgan from 'morgan';
import 'dotenv/config';
import { AppModule } from './app.module';
import constants from './constants';

async function bootstrap() {
	const { PORT, API_URL } = process.env;

	const app = await NestFactory.create(AppModule);

	app.use(compresion());
	app.use(helmet());
	app.use(morgan('dev'));

	app.enableCors({
		origin: constants.WHITELIST,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);

	await app.listen(PORT);
	Logger.log(`The Supichi RESTful API is running at ${API_URL}`);
}
bootstrap();
