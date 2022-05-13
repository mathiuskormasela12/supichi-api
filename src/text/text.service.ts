// ========= Text Service
// import all modules
import {
	HttpStatus,
	Inject,
	Injectable,
	Param,
	ParseIntPipe,
	Query,
	Request,
} from '@nestjs/common';
import * as tesseract from 'tesseract.js';
import * as moment from 'moment';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { IRequestWithUploadAndAppLocals } from '../interfaces';
import { ResponseService } from '../response/response.service';
import { UploadService } from '../upload/upload.service';
import { GenerateTextFromImageDto, GetTextsDto } from './dto';
import constants from 'src/constants';
import { Text } from './text.entity';
import { TextsVoicesResults } from 'src/types';

@Injectable()
export class TextService {
	constructor(
		private responseService: ResponseService,
		private uploadService: UploadService,
		@Inject('TEXTS_REPOSITORY')
		private textsRepository: typeof Text,
	) {}

	public async generateTextFromImage(
		@Request() req: IRequestWithUploadAndAppLocals,
		dto: GenerateTextFromImageDto,
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

			try {
				const result = await this.textsRepository.create({
					text: textWithoutLinebreak,
					userId: req.app.locals.decode.id,
					renderFrom: dto.renderFrom,
				});

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.CREATED,
					true,
					'The image has been converted to text successfully',
					result,
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

	public async removeText(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const text = await this.textsRepository.findOne({ where: { id } });

			if (!text) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The data does not exist',
				);
			}

			try {
				await this.textsRepository.destroy({ where: { id } });

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'The text has been deleted successfully',
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

	public async getTextDetail(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const textDetail = await this.textsRepository.findByPk(id);

			if (!textDetail) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The text does not exist',
				);
			}

			const result = {
				id: textDetail.id,
				renderFrom: textDetail.renderFrom,
				text: textDetail.text,
				date: moment(textDetail.createdAt).format('hh:mma'),
			};

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Successfully to get detail of text',
				result,
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

	public async getTexts(
		@Request() req: Request,
		@Query() queries: GetTextsDto,
	) {
		const { page, limit, groupByDate, orderBy } = queries;
		const startData = limit * page - limit;
		try {
			const { count: totalData, rows } =
				await this.textsRepository.findAndCountAll({
					attributes: ['id', 'text', 'createdAt'],
					limit,
					offset: startData,
					order: [['createdAt', orderBy.toUpperCase()]],
					where: { userId: queries.id },
				});
			const totalPages = Math.ceil(totalData / limit);

			if (rows.length < 1) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					'The texts do not exist',
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
						text: item.text,
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
					'Successfully to get texts',
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
					'Successfully to get texts',
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
}
