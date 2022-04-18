// ========= Text Controller
// import all modules
import {
	Body,
	Controller,
	Post,
	Request,
	UseGuards,
	Delete,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { GenerateTextFromImageDto } from './dto';
import { TextService } from './text.service';

@Controller('api/v1')
export class TextController {
	constructor(private textService: TextService) {}

	@Post('text')
	@UseGuards(AuthGuard)
	public generateTextFromImage(
		@Request() req: IRequestWithUploadAndAppLocals,
		@Body() dto: GenerateTextFromImageDto,
	) {
		return this.textService.generateTextFromImage(req, dto);
	}

	@Delete('text/:id')
	@UseGuards(AuthGuard)
	public removeText(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.textService.removeText(req, id);
	}
}
