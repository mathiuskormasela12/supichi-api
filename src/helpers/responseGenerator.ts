// =========== Response Generator
// import all modules
import { parse } from 'url';
import 'dotenv/config';
import { ResponseGeneratorFunc, ResponseResults } from '../types';

const { APP_URL } = process.env;

export const responseGenerator: ResponseGeneratorFunc = (
	req: Request,
	status: number,
	success: boolean,
	message: string,
	results?: unknown,
	totalPages?: number,
	totalData?: number,
): ResponseResults => {
	if (results && typeof results === 'object' && !Array.isArray(results)) {
		return {
			status,
			success,
			message,
			results,
		};
	} else if (
		results &&
		typeof results === 'object' &&
		Array.isArray(results) &&
		totalData &&
		totalPages
	) {
		const {
			query: { page = 1, ...queries },
			pathname,
		} = parse(req.url, true);
		const modifiedQueries = { page, ...queries };
		return {
			status,
			success,
			message,
			results,
			pageInfo: {
				totalPages,
				totalData,
				currentPage: Number(page),
				previousLink:
					Number(page) > 1
						? `${APP_URL}${pathname}?${Object.keys(modifiedQueries)
								.map(
									(item, index) =>
										`${
											item === 'page'
												? `${item}=${
														Number(Object.values(modifiedQueries)[index]) - 1
												  }`
												: `${item}=${Object.values(modifiedQueries)[index]}`
										}`,
								)
								.join('&')}`
						: null,
				nextLink:
					Number(page) < totalPages
						? `${APP_URL}${pathname}?${Object.keys(modifiedQueries)
								.map(
									(item, index) =>
										`${
											item === 'page'
												? `${item}=${
														Number(Object.values(modifiedQueries)[index]) + 1
												  }`
												: `${item}=${Object.values(modifiedQueries)[index]}`
										}`,
								)
								.join('&')}`
						: null,
			},
		};
	} else {
		return {
			status,
			success,
			message,
		};
	}
};
