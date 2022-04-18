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
import { GenerateVoiceFromImageDto } from './dto';
import { VoiceService } from './voice.service';

@Controller('api/v1')
export class VoiceController {
	constructor(private textService: VoiceService) {}

	@Post('voice')
	@UseGuards(AuthGuard)
	public generateVoiceFromImage(
		@Request() req: IRequestWithUploadAndAppLocals,
		@Body() dto: GenerateVoiceFromImageDto,
	) {
		return this.textService.generateVoiceFromImage(req, dto);
	}

	@Delete('voice/:id')
	@UseGuards(AuthGuard)
	public removeVoice(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.textService.removeVoice(req, id);
	}
}
