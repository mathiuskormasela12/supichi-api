// ========== IUploadFileResponse

export interface IUploadFileResponse {
	status?: number;
	success?: boolean;
	message?: string;
	photo?: string;
	voice?: string;
}
