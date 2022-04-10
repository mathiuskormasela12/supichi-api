// ========== Response
// import all modules
import { HttpException } from '@nestjs/common';
import { IResponse } from 'src/interfaces';
import { ResponseFunc } from 'src/types/responseFunc';

export const response: ResponseFunc = (response: IResponse) => {
	return new HttpException(response, response.status);
};
