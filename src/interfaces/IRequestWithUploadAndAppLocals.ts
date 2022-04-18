// ========== IRequestWithUploadAndAppLocals
// import all modules
import { IRequestWithUpload } from './IRequestWithUpload';

export interface IRequestWithUploadAndAppLocals extends IRequestWithUpload {
	app: {
		locals: {
			decode: {
				id: number;
				username: string;
				iat: number;
				exp: number;
			};
		};
	};
}
