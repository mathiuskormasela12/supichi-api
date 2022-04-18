// ========= Voice Service
// import all modules
import {
	HttpStatus,
	Injectable,
	Request,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tesseract from 'tesseract.js';
import { unlinkSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { IRequestWithUploadAndAppLocals } from '../interfaces';
import { ResponseService } from '../response/response.service';
import { UploadService } from '../upload/upload.service';
import { GenerateVoiceFromImageDto } from './dto';
import { GttsService } from '../gtts/gtts.service';
import constants from '../constants';

@Injectable()
export class VoiceService {
	constructor(
		private responseService: ResponseService,
		private uploadService: UploadService,
		private prismaService: PrismaService,
		private configService: ConfigService,
		private gttsService: GttsService,
	) {}

	public async generateVoiceFromImage(
		@Request() req: IRequestWithUploadAndAppLocals,
		dto: GenerateVoiceFromImageDto,
	) {
		if (constants.LANGUAGES.indexOf(dto.language) === -1) {
			throw this.responseService.response({
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'Unknown language',
			});
		}

		const { status, success, message, photo } = this.uploadService.uploadPhoto(
			req,
			`/images/`,
		);

		if (!success) {
			throw this.responseService.response({
				status,
				success,
				message,
			});
		}

		const imagePath = join(__dirname, '../../public/images/' + photo);

		try {
			const {
				data: { text },
			}: tesseract.RecognizeResult = await tesseract.recognize(
				imagePath,
				constants.Tesseract_LANGUAGES[dto.language],
			);
			unlinkSync(imagePath);

			const textArray: string[] = text.split(' ');
			const textWithoutLinebreak = textArray
				.map((item: string) => {
					const textWithLineBreak = item.match(/\w/g);

					if (textWithLineBreak) {
						return item.replace(/\s/g, ' ');
					} else {
						return item;
					}
				})
				.join(' ');

			const voicesFolder = join(__dirname, '../../public/voices/');
			if (!existsSync(voicesFolder)) {
				mkdirSync(voicesFolder);
			}
			const voiceFileName: string = String(Date.now()).concat('.mp3');
			const voicePath = join(__dirname, `../../public/voices/` + voiceFileName);
			const voiceLink: string = this.configService
				.get('APP_URL')
				.concat('/voices/', voiceFileName);

			try {
				await this.gttsService.gTTS(textWithoutLinebreak, {
					lang: dto.language,
					path: voicePath,
				});
				try {
					const result = await this.prismaService.voice.create({
						data: {
							voice: voiceFileName,
							text: textWithoutLinebreak,
							userId: req.app.locals.decode.id,
							renderFrom: dto.renderFrom,
						},
					});

					throw this.responseService.responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'The image has been converted to text successfully',
						{ ...result, voiceLink },
					);
				} catch (err) {
					if (err instanceof Error) {
						throw this.responseService.responseGenerator(
							req,
							HttpStatus.BAD_REQUEST,
							false,
							err.message,
						);
					} else {
						throw err;
					}
				}
			} catch (err) {
				if (err instanceof Error) {
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.BAD_REQUEST,
						false,
						err.message,
					);
				} else {
					throw err;
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
	}

	public async removeVoice(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const voice = await this.prismaService.voice.findFirst({ where: { id } });

			if (!voice) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The data does not exist',
				);
			}

			const voiceFileName: string = voice.voice;
			const voicePath = join(__dirname, `../../public/voices/` + voiceFileName);

			try {
				await this.prismaService.voice.delete({ where: { id } });
				rmSync(voicePath);

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'The data has been deleted successfully',
				);
			} catch (err) {
				if (err instanceof Error) {
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.BAD_REQUEST,
						false,
						err.message,
					);
				} else {
					throw err;
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
	}

	public async getVoiceDetail(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const voiceDetail = await this.prismaService.voice.findUnique({
				where: { id },
			});

			if (!voiceDetail) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The voice does not exist',
				);
			}

			const voiceLink: string = this.configService
				.get('APP_URL')
				.concat('/voices/', voiceDetail.voice);

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Successfully to get detail of voice',
				{ ...voiceDetail, voiceLink },
			);
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
	}
}
