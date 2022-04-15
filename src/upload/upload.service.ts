// ========= Upload Service
// import all modules
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import { join } from 'path';
import { IRequestWithUpload, IUploadPhotoResponse } from '../interfaces';

@Injectable()
export class UploadService {
	public uploadPhoto(
		@Request() req: IRequestWithUpload,
		path: string,
	): IUploadPhotoResponse {
		if (!req.files) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The user photo is required',
			};
		}

		const photo = req.files.photo;
		const extValid = /jpg|jpeg|png|svg/gi;
		const checkMimeType = extValid.test(photo.mimetype);
		const checkExt = extValid.test(photo.name);

		if (!checkMimeType && !checkExt) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: "You can't upload files other than image",
			};
		}

		if (photo.size > 3000000) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The size of photo is too large',
			};
		}

		const fileExt = photo.name.split('.')[1].toLowerCase();
		let fileName = '';
		fileName += photo.name.split('.')[0].toLowerCase();
		fileName += '-';
		fileName += String(Date.now());
		fileName += '.';
		fileName += fileExt;

		photo.mv(join(__dirname, '../../public' + path + fileName));

		return {
			success: true,
			photo: fileName,
		};
	}
}
