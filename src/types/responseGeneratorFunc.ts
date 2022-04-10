// ========== Response Generator Func

export type ResponseResults = {
	status: number;
	success: boolean;
	message: string;
	results?: unknown;
	pageInfo?: {
		totalPages: number;
		totalData: number;
		currentPage: number;
		previousLink: string | null;
		nextLink: string | null;
	};
};

export type ResponseGeneratorFunc = (
	req: Request,
	status: number,
	success: boolean,
	message: string,
	results?: unknown,
	totalPages?: number,
	totalData?: number,
) => ResponseResults;
