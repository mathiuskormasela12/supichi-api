// ========= Upload Service
// import all modules
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { IRequestWithUpload, IUploadFileResponse } from '../interfaces';

@Injectable()
export class UploadService {
	public uploadPhoto(
		@Request() req: IRequestWithUpload,
		path: string,
	): IUploadFileResponse {
		if (!req.files || !req.files.photo) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The photo is required',
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

		const fileExt = photo.name.split('.').pop().toLowerCase();
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

	public uploadVoice(
		@Request() req: IRequestWithUpload,
		username: string,
	): IUploadFileResponse {
		if (!req.files) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The voice file is required',
			};
		}

		const voice = req.files.voice;
		const extValid = /mp3/gi;
		const checkMimeType = extValid.test(voice.mimetype);
		const checkExt = extValid.test(voice.name);

		if (!checkMimeType && !checkExt) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: "You can't upload files other than voice file",
			};
		}

		const fileExt = voice.name.split('.')[1].toLowerCase();
		let fileName = '';
		fileName += voice.name.split('.')[0].toLowerCase();
		fileName += '-';
		fileName += String(Date.now());
		fileName += '.';
		fileName += fileExt;

		if (existsSync(join(__dirname, `../../public/voices/${username}`))) {
			voice.mv(join(__dirname, `../../public/voices/${username}/${fileName}`));
		} else {
			mkdirSync(join(__dirname, `../../public/voices/${username}`));
			voice.mv(join(__dirname, `../../public/voices/${username}/${fileName}`));
		}

		return {
			success: true,
			voice: fileName,
		};
	}
}
