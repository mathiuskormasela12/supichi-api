// ========== Voice Providers
// import all modules
import { Voice } from './voice.entity';

export const voicesProviders = [
	{
		provide: 'VOICES_REPOSITORY',
		useValue: Voice,
	},
];
