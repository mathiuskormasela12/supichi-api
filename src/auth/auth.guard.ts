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
import { response } from 'src/helpers';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const token = request.headers['x-access-token'];
		const secret = this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY');

		if (!token) {
			throw response({
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
				throw response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			}
		}
	}
}
