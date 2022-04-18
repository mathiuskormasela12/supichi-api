// ========== Get Texts Dto
// import all modules
import { Type } from 'class-transformer';

export class GetTextsDto {
	@Type(() => Number)
	page?: number;
}
