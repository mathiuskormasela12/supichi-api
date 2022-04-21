// ========== Text Providers
// import all modules
import { Text } from './text.entity';

export const textsProviders = [
	{
		provide: 'TEXTS_REPOSITORY',
		useValue: Text,
	},
];
