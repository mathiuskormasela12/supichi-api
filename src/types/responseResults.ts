// ========== ResponseResults

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
