// ========= Auth Controller
// import all modules
import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}
	@Get('auth/register')
	public register() {
		return this.authService.register();
	}
}
