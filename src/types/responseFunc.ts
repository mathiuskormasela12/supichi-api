// ========== ResponseFunc
// import all modules
import { HttpException } from '@nestjs/common';
import { ResponseResults } from '.';

export type ResponseFunc = (response: ResponseResults) => HttpException;
