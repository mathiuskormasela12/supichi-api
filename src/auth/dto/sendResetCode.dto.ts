// ========== Send Reset Dto
// import all modules
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendResetCodeDto {
	@IsEmail()
	@IsString({ message: 'The username must be a string' })
	@IsNotEmpty({ message: "The username can't be empty" })
	username: string;
}
