// ========== Auth Service
// import all modules
import { Injectable, HttpStatus, Request, Body } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { response, responseGenerator } from '../helpers';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
	constructor(private prismaService: PrismaService) {}

	public async register(@Request() req: Request, @Body() dto: RegisterDto) {
		try {
			const user = await this.prismaService.user.findFirst({
				where: {
					username: dto.username,
				},
			});

			if (user) {
				throw responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The username is already in used',
				);
			}
			try {
				const hashed = await argon.hash(dto.password);
				try {
					const result = await this.prismaService.user.create({
						data: {
							fullName: dto.fullName,
							username: dto.username,
							password: hashed,
						},
					});

					delete result.password;
					delete result.otp;
					delete result.photo;

					throw responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'Register Successfully',
						result,
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
