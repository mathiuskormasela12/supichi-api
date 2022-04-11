// ========= Auth Controller
// import all modules
import { Controller, Post, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}
	@Post('auth/register')
	public register(@Request() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto);
	}
}
