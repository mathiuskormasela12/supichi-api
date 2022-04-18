// ========== Gtts Module
// import all modules
import { Global, Module } from '@nestjs/common';
import { GttsService } from './gtts.service';

@Global()
@Module({
	providers: [GttsService],
	exports: [GttsService],
})
export class GttsModule {}
