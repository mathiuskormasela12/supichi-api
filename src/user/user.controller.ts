// ========== User Controller
// import all modules
import {
	Body,
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
import { EditUserProfileDto } from './dto';

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

	@Put('user/:id')
	@UseGuards(AuthGuard)
	public editUserProfile(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: EditUserProfileDto,
	) {
		return this.userService.editUserProfile(req, id, dto);
	}
}
