// ========= Auth Controller
// import all modules
import { Controller, Post, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
	CreateAccessTokenByRefresh,
	LoginDto,
	RegisterDto,
	SendResetCodeDto,
} from './dto';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('auth/register')
	public register(@Request() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto);
	}

	@Post('auth/login')
	public login(@Request() req: Request, @Body() dto: LoginDto) {
		return this.authService.login(req, dto);
	}

	@Post('auth/otp')
	public sendOtp(@Request() req: Request, @Body() dto: SendResetCodeDto) {
		return this.authService.sendOtp(req, dto);
	}

	@Post('auth/access-token')
	public getAccessToken(
		@Request() req: Request,
		@Body() dto: CreateAccessTokenByRefresh,
	) {
		return this.authService.createAccessTokenByRefreshToken(req, dto);
	}
}
