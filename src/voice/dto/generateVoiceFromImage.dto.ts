// ========== Generaye Voice From Image Dto
// import all modules
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateVoiceFromImageDto {
	@IsString({ message: 'The language must be a string' })
	@IsNotEmpty({ message: "The language can't be empty" })
	language: string;

	@IsString({ message: 'The render from field must be a string' })
	@IsNotEmpty({ message: "The render from field can't be empty" })
	renderFrom: string;
}
