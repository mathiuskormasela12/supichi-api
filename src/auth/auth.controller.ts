// ========= Auth Controller
// import all modules
import { Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}
	@Post('auth/register')
	public register(@Request() req: Request) {
		return this.authService.register(req);
	}
}
