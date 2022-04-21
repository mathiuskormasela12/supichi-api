// ========== IRequestWithUpload

export interface IRequestWithUpload extends Request {
	files: {
		photo?: {
			name: string;
			mimetype: string;
			size: number;
			mv: (path: string) => void;
		};
		voice?: {
			name: string;
			mimetype: string;
			size: number;
			mv: (path: string) => void;
		};
	};
}
