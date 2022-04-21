// ========== Get Voices Dto
// import all modules
import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVoicesDto {
	@Type(() => Number)
	@IsNumber({}, { each: true })
	page?: number = 1;

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
