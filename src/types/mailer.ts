// ========== Mailer
// import all modules

import { MailerService } from '@nestjs-modules/mailer';

export type ResetMailerFunc = (
	mailer: MailerService,
	to: string,
	from: string,
	code: string,
) => any;
