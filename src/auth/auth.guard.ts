// ========== Auth Guard
// import all modules
import {
	CanActivate,
	ExecutionContext,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private responseService: ResponseService,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const token = request.headers['x-access-token'];
		const secret = this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY');

		if (!token) {
			throw this.responseService.response({
				status: HttpStatus.FORBIDDEN,
				success: false,
				message: 'Forbidden',
			});
		} else {
			try {
				const decode = this.jwtService.verify(token, { secret });
				request.app.locals.decode = decode;
				return true;
			} catch (err) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			}
		}
	}
}
