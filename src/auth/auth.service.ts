// ========== Auth Service
// import all modules
import { Injectable, HttpStatus, Request, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { response, responseGenerator } from '../helpers';
import { RegisterDto, LoginDto, CreateAccessTokenByRefresh } from './dto';
import { IJwtToken } from '../interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService,
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
