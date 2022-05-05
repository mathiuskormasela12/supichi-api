// ========== Get Texts Dto
// import all modules
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTextsDto {
	@Type(() => Number)
	@IsNumber({}, { each: true })
	page?: number = 1;

	@Type(() => Number)
	@IsNumber({}, { each: true })
	@IsNotEmpty({ message: 'The id is required' })
	id: number;

	@Type(() => Number)
	@IsNumber({}, { each: true })
	limit?: number = 5;

	@Type(() => Number)
	@IsNumber({}, { each: true })
	groupByDate?: number = 1;

	@Type(() => String)
	@IsString({ each: true })
	orderBy?: string = 'asc';
}
