// ========== Login Dto
// import all modules
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MinLength,
} from 'class-validator';

export class LoginDto {
	@IsEmail({ message: 'The username must be an email' })
	@IsString({ message: 'The username must be a string' })
	@IsNotEmpty({ message: "The username can't be empty" })
	username: string;

	@MinLength(5, { message: 'The password is too short' })
	@Matches(/[A-Z]/, { message: 'The password is too weak' })
	@Matches(/[a-z]/, { message: 'The password is too weak' })
	@Matches(/[0-9]/, { message: 'The password is too weak' })
	@Matches(/[\W]/, { message: 'The password is too weak' })
	@IsString({ message: 'The password must be a string' })
	@IsNotEmpty({ message: "The password can't be empty" })
	password: string;
}
