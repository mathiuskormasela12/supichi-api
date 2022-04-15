// ========== IUpload
// import all modules
import { Request } from '@nestjs/common';

export interface IRequestWithUpload extends Request {
	files: {
		photo: {
			name: string;
			mimetype: string;
			size: number;
			mv: (path: string) => void;
		};
	};
}
