// ========= Voice Controller
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
	Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { GenerateVoiceFromImageDto } from './dto';
import { VoiceService } from './voice.service';

@Controller('api/v1')
export class VoiceController {
	constructor(private voiceService: VoiceService) {}

	@Post('voice')
	@UseGuards(AuthGuard)
	public generateVoiceFromImage(
		@Request() req: IRequestWithUploadAndAppLocals,
		@Body() dto: GenerateVoiceFromImageDto,
	) {
		return this.voiceService.generateVoiceFromImage(req, dto);
	}

	@Delete('voice/:id')
	@UseGuards(AuthGuard)
	public removeVoice(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.voiceService.removeVoice(req, id);
	}

	@Get('voice/:id')
	@UseGuards(AuthGuard)
	public getDetailVoice(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.voiceService.getVoiceDetail(req, id);
	}
}
