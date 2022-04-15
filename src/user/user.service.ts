// ========== User Service
// import all modules
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { response, responseGenerator } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { IRequestWithUpload } from '../interfaces';

@Injectable()
export class UserService {
	constructor(
		private uploadService: UploadService,
		private prismaService: PrismaService,
		private configService: ConfigService,
	) {}

	public async uploadPhoto(@Request() req: IRequestWithUpload, id: number) {
		try {
			const user = await this.prismaService.user.findFirst({
				where: {
					id,
				},
			});

			if (!user) {
				throw responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The user does not exist',
				);
			}

			const { success, photo, message, status } =
				this.uploadService.uploadPhoto(req, '/images/');

			if (!success) {
				throw responseGenerator(req, status, success, message);
			}

			try {
				const result = await this.prismaService.user.update({
					data: { photo },
					where: { id },
				});

				delete result.password;
				delete result.fullName;
				delete result.fullName;
				delete result.username;

				throw responseGenerator(
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
					throw responseGenerator(
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
				throw response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw response(err);
			}
		}
	}
}
