// ========== TextsVoicesResults

export type TextsVoicesResults = [
	{
		today: {
			date: string;
			data: unknown[];
		};
		theDayBeforeToday: {
			date: string;
			data: unknown[];
		};
	},
];
