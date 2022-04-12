// ========== Create Access Token By Refresh
// import all modules

import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class CreateAccessTokenByRefresh {
	@IsJWT({ message: 'The refresh token is invalid' })
	@IsString({ message: 'The refresh token must be a string' })
	@IsNotEmpty({ message: "The refresh token can't be empty" })
	refreshToken: string;
}
