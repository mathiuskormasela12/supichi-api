// ========== User Controller
// import all modules
import {
	Controller,
	Param,
	ParseIntPipe,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IRequestWithUpload } from '../interfaces';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/v1')
export class UserController {
	constructor(private userService: UserService) {}

	@Put('user/photo/:id')
	@UseGuards(AuthGuard)
	public uploadPhoto(
		@Request() req: IRequestWithUpload,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.userService.uploadPhoto(req, id);
	}
}
