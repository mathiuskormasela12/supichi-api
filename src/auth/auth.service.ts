// ========== Auth Service
// import all modules

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(private prismaService: PrismaService) {}

	public async register() {
		try {
			const results = await this.prismaService.user.findMany();

			return results;
		} catch (err) {
			return err;
		}
	}
}
