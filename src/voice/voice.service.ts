// ========= Voice Service
// import all modules
import {
	HttpStatus,
	Injectable,
	Request,
	Param,
	ParseIntPipe,
	Inject,
	Query,
	Response,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tesseract from 'tesseract.js';
import * as moment from 'moment';
import { unlinkSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import {
	IRequestWithUploadAndAppLocals,
	IResponseWithDownload,
} from '../interfaces';
import { ResponseService } from '../response/response.service';
import { UploadService } from '../upload/upload.service';
import { GenerateVoiceFromImageDto, GetVoicesDto } from './dto';
import { GttsService } from '../gtts/gtts.service';
import constants from '../constants';
import { Voice } from './voice.entity';
import { TextsVoicesResults } from 'src/types';

@Injectable()
export class VoiceService {
	constructor(
		private responseService: ResponseService,
		private uploadService: UploadService,
		@Inject('VOICES_REPOSITORY')
		private voicesRepository: typeof Voice,
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
					const { dataValues }: any = await this.voicesRepository.create({
						voice: voiceFileName,
						text: textWithoutLinebreak,
						userId: req.app.locals.decode.id,
						renderFrom: dto.renderFrom,
					});
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'The image has been converted to text successfully',
						{ ...dataValues, voiceLink },
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
			const voice = await this.voicesRepository.findOne({ where: { id } });

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
				await this.voicesRepository.destroy({ where: { id } });
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
			const { dataValues: voiceDetail }: any =
				await this.voicesRepository.findByPk(id);

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

	public async getVoices(
		@Request() req: Request,
		@Query() queries: GetVoicesDto,
	) {
		const { page, limit, groupByDate, orderBy } = queries;
		const startData = limit * page - limit;
		try {
			const { count: totalData, rows } =
				await this.voicesRepository.findAndCountAll({
					attributes: ['id', 'text', 'createdAt'],
					limit,
					offset: startData,
					order: [['id', orderBy.toUpperCase()]],
				});
			const totalPages = Math.ceil(totalData / limit);

			if (rows.length < 1) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					'The voices do not exist',
					[],
				);
			}

			if (groupByDate > 0) {
				const results: TextsVoicesResults = [
					{
						date: `Today, ${moment(Date.now()).format('MMM/DD/YYYY')}`,
						data: [],
					},
					{
						date: 'Yesterday',
						data: [],
					},
				];

				for (const item of rows) {
					const createdAt: string = moment(item.createdAt).format(
						'DD-MMM-YYYY',
					);
					const today: string = moment(Date.now()).format('DD-MMM-YYYY');
					const data = {
						id: item.id,
						text: item.text.slice(0, 26).concat('...'),
						time: moment(item.createdAt).format('hh:mma'),
					};

					if (createdAt === today) {
						results[0].data.push(data);
					} else {
						results[1].data.push(data);
					}
				}

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'Successfully to get all voices',
					results,
					totalPages,
					totalData,
				);
			} else {
				const modifiedResults = rows.map((item) => ({
					id: item.id,
					text: item.text.slice(0, 26).concat('...'),
					time: moment(item.createdAt).format('hh:mma'),
				}));
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'Successfully to get all voices',
					modifiedResults,
					totalPages,
					totalData,
				);
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

	public async downloadVoice(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
		@Response() res: IResponseWithDownload,
	) {
		try {
			const voice = await this.voicesRepository.findByPk(id);

			if (!voice) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					'The voice does not exist',
				);
			}
			const voiceFileName: string = voice.voice;
			const voicePath = join(__dirname, `../../public/voices/` + voiceFileName);
			res.download(voicePath);
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
