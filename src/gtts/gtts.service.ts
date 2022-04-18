// ========== Gtts Service
// import all modules
import { Injectable } from '@nestjs/common';
import * as fakeUa from 'fake-useragent';
import * as fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import constants from '../constants';

@Injectable()
export class GttsService {
	public async gTTS(text, data: any = {}) {
		data.lang ??= 'en';
		data.lang = data.lang.toLowerCase();
		if (!text) throw new Error('No text to speak');
		if (!constants.GTTS_LANGUAGES[data.lang])
			throw new Error(`Language not supported: ${data.lang}`);
		const parts = text
			.match(/[\s\S]{1,100}(?!\S)|[\s\S]{1,100}/g)
			.map((e) => e.trim());
		const buff = Buffer.concat(
			await Promise.all(
				parts.map((e, i) =>
					fetch(
						constants.GTTS_BASE +
							`?ie=UTF-8&tl=${data.lang}&q=${encodeURIComponent(e)}&total=${
								e.length
							}&idx=${i}&client=tw-ob&textlen=${e.length}`,
						{
							headers: {
								'User-Agent': fakeUa(),
							},
						},
					)
						.then((r) => r.arrayBuffer())
						.then((b) => Buffer.from(b)),
				),
			),
		);
		if (data.path) writeFileSync(data.path, buff);
		else return buff;
	}
}
