// ========== IResponseWithDownload

export interface IResponseWithDownload extends Response {
	download: (file: string) => void;
}
