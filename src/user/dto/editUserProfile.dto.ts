// ========== Edit User Profile Dto
// import all modules
import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';

export class EditUserProfileDto {
	@MaxLength(40, { message: 'The full name is too long' })
	@IsString({ message: 'The full name must be a string' })
	@IsNotEmpty({ message: "The full name can't be empty" })
	fullName: string;

	@IsEmail({ message: 'The username must be an email' })
	@IsString({ message: 'The username must be a string' })
	@IsNotEmpty({ message: "The username can't be empty" })
	username: string;
}
