// ========== Reset Password Dto
// import all modules
import {
	IsNotEmpty,
	IsNumberString,
	MinLength,
	Matches,
	IsString,
} from 'class-validator';

export class ResetPasswordDto {
	@IsNumberString({ message: 'The rese code is invalid' })
	@IsNotEmpty({ message: "The reset code can't be empty" })
	resetCode: string;

	@MinLength(5, { message: 'The new password is too short' })
	@Matches(/[A-Z]/, { message: 'The new password is too weak' })
	@Matches(/[a-z]/, { message: 'The new password is too weak' })
	@Matches(/[0-9]/, { message: 'The new password is too weak' })
	@Matches(/[\W]/, { message: 'The new password is too weak' })
	@IsString({ message: 'The new password must be a string' })
	@IsNotEmpty({ message: "The new password can't be empty" })
	newPassword: string;

	@MinLength(5, { message: 'The confirm password is too short' })
	@Matches(/[A-Z]/, { message: 'The confirm password is too weak' })
	@Matches(/[a-z]/, { message: 'The confirm password is too weak' })
	@Matches(/[0-9]/, { message: 'The confirm password is too weak' })
	@Matches(/[\W]/, { message: 'The confirm password is too weak' })
	@IsString({ message: 'The confirm password must be a string' })
	@IsNotEmpty({ message: "The confirm password can't be empty" })
	confirmPassword: string;
}
