// ========== Auth Service
// import all modules
import { Injectable, HttpStatus, Request, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { response, responseGenerator, sendResetCode } from '../helpers';
import {
	RegisterDto,
	LoginDto,
	CreateAccessTokenByRefresh,
	SendResetCodeDto,
	ResetPasswordDto,
} from './dto';
import { IJwtToken } from '../interfaces';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private mailerService: MailerService,
	) {}

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

	public async login(@Request() req: Request, @Body() dto: LoginDto) {
		try {
			const user = await this.prismaService.user.findFirst({
				where: {
					username: dto.username,
				},
			});

			if (!user || !(await argon.verify(user.password, dto.password))) {
				throw responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The username or the password is wrong',
				);
			}

			const payload = {
				id: user.id,
				username: user.username,
			};
			try {
				const accessToken = await this.generateAccessToken(payload);
				try {
					const refreshToken = await this.generateRefreshToken(payload);

					throw responseGenerator(
						req,
						HttpStatus.OK,
						true,
						'Login Successfully',
						{
							accessToken,
							refreshToken,
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

	public async createAccessTokenByRefreshToken(
		@Request() req: Request,
		@Body() dto: CreateAccessTokenByRefresh,
	) {
		try {
			const decode = await this.verifyToken(dto.refreshToken);
			try {
				const refreshToken = await this.generateRefreshToken({
					id: decode.id,
					username: decode.username,
				});

				try {
					const accessToken = await this.generateAccessToken({
						id: decode.id,
						username: decode.username,
					});
					throw responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'The access token is created successfully',
						{ accessToken, refreshToken },
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

	public async sendOtp(@Request() req: Request, @Body() dto: SendResetCodeDto) {
		try {
			const user = await this.prismaService.user.findUnique({
				where: {
					username: dto.username,
				},
			});

			if (!user) {
				throw responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					"The username isn't found",
				);
			}

			if (user.otp) {
				throw responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'You have the reset code already, please check your email',
				);
			}

			const otp = `${Math.floor(Math.random() * 9) + 1}${
				Math.floor(Math.random() * 9) + 1
			}${Math.floor(Math.random() * 9) + 1}${
				Math.floor(Math.random() * 9) + 1
			}`;

			try {
				await sendResetCode(
					this.mailerService,
					dto.username,
					this.configService.get('EMAIL'),
					otp,
				);
				try {
					await this.prismaService.user.update({
						data: { otp },
						where: { id: user.id },
					});
					throw responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'The reset code has been sent',
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

	public async resetPassword(
		@Request() req: Request,
		@Body() dto: ResetPasswordDto,
	) {
		if (dto.newPassword !== dto.confirmPassword) {
			throw response({
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: "The new password and the confirm password doesn't match",
			});
		}

		try {
			const isOtpExists = await this.prismaService.user.findFirst({
				where: { otp: dto.resetCode },
			});

			if (!isOtpExists) {
				throw responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The otp code is invalid',
				);
			}

			try {
				const hashed = await argon.hash(dto.newPassword);
				try {
					const result = await this.prismaService.user.update({
						data: { otp: null, password: hashed },
						where: { id: isOtpExists.id },
					});

					delete result.password;
					delete result.otp;
					delete result.photo;

					throw responseGenerator(
						req,
						HttpStatus.OK,
						true,
						'Reset Password Successfully',
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

	public async generateRefreshToken(data: IJwtToken): Promise<string> {
		const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY');
		const expiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN');

		return await this.jwtService.sign(data, { expiresIn, secret });
	}

	public async generateAccessToken(data: IJwtToken): Promise<string> {
		const secret = this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY');
		const expiresIn = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN');

		return await this.jwtService.sign(data, { expiresIn, secret });
	}

	public async verifyToken(token: string): Promise<any> {
		const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY');

		return await this.jwtService.verify(token, { secret });
	}
}
