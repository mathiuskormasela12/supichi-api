// ========== Auth Service
// import all modules
import { Injectable, HttpStatus, Request } from '@nestjs/common';
import { response, responseGenerator } from '../helpers';

@Injectable()
export class AuthService {
	public async register(@Request() req: Request) {
		// throw response({
		// 	status: HttpStatus.OK,
		// 	success: true,
		// 	message: 'Hi',
		// });
		throw response(
			responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'This is the results',
				[1, 2, 4],
				5,
				10,
			),
		);
	}
}
