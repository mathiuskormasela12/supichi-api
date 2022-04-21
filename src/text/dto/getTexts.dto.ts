// ========== Get Texts Dto
// import all modules
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTextsDto {
	@Type(() => Number)
	@IsNumber({}, { each: true })
	page?: number = 1;

	@Type(() => Number)
	@IsNumber({}, { each: true })
	limit?: number = 5;
}
