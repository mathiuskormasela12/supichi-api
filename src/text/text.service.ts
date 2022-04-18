// ========= Text Service
// import all modules
import {
	HttpStatus,
	Injectable,
	Param,
	ParseIntPipe,
	Request,
} from '@nestjs/common';
import * as tesseract from 'tesseract.js';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { IRequestWithUploadAndAppLocals } from '../interfaces';
import { ResponseService } from '../response/response.service';
import { UploadService } from '../upload/upload.service';
import { GenerateTextFromImageDto } from './dto';
import constants from 'src/constants';

@Injectable()
export class TextService {
	constructor(
		private responseService: ResponseService,
		private uploadService: UploadService,
		private prismaService: PrismaService,
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
				const result = await this.prismaService.text.create({
					data: {
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
			const text = await this.prismaService.text.findFirst({ where: { id } });

			if (!text) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The data does not exist',
				);
			}

			try {
				await this.prismaService.text.delete({ where: { id } });

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
			const textDetail = await this.prismaService.text.findUnique({
				where: { id },
			});

			if (!textDetail) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The text does not exist',
				);
			}

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Successfully to get detail of text',
				textDetail,
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
