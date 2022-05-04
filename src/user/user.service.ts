// ========== User Service
// import all modules
import {
	Body,
	HttpStatus,
	Inject,
	Injectable,
	Param,
	ParseIntPipe,
	Request,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseService } from 'src/response/response.service';
import { UploadService } from 'src/upload/upload.service';
import { IRequestWithUpload } from '../interfaces';
import { EditUserProfileDto } from './dto';
import { User } from './user.entity';
import { Text } from '../text/text.entity';
import { Voice } from '../voice/voice.entity';

@Injectable()
export class UserService {
	constructor(
		private uploadService: UploadService,
		@Inject('USERS_REPOSITORY')
		private usersRepository: typeof User,
		@Inject('TEXTS_REPOSITORY')
		private textsRepository: typeof Text,
		@Inject('TEXTS_REPOSITORY')
		private voicesRepository: typeof Voice,
		private configService: ConfigService,
		private responseService: ResponseService,
	) {}

	public async uploadPhoto(@Request() req: IRequestWithUpload, id: number) {
		try {
			const user = await this.usersRepository.findOne({ where: { id } });

			if (!user) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The user does not exist',
				);
			}

			const { success, photo, message, status } =
				this.uploadService.uploadPhoto(req, `/images/`);

			if (!success) {
				throw this.responseService.responseGenerator(
					req,
					status,
					success,
					message,
				);
			}

			try {
				await this.usersRepository.update({ photo }, { where: { id } });

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'The user photo has been edited successfully',
					{
						photo: String(this.configService.get('APP_URL')).concat(
							'/images/',
							photo,
						),
					},
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

	public async editUserProfile(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: EditUserProfileDto,
	) {
		try {
			const user = await this.usersRepository.findByPk(id);

			if (!user) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The user does not exist',
				);
			}

			try {
				await this.usersRepository.update(
					{ fullName: dto.fullName, username: dto.username },
					{
						where: { id },
					},
				);

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'The user profile has been updated successfully',
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

	public async getUserProfile(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const user = await this.usersRepository.findByPk(id);

			if (!user) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The user does not exist',
				);
			}

			try {
				const textsCount = await this.textsRepository.count();

				try {
					const voicesCount = await this.voicesRepository.count();
					const results = {
						id: user.id,
						fullName: user.fullName,
						username: user.username,
						photo: String(this.configService.get('APP_URL')).concat(
							'/images/',
							user.photo,
						),
						textsCount,
						voicesCount,
					};
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.OK,
						true,
						'Get user profile successfully',
						results,
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
}
