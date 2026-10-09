import { error } from '@sveltejs/kit';
import { DeezerError, getAlbum } from '#lib/deezer.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (!/^\d+$/.test(params.id)) error(404, 'Album not found');

	try {
		return { album: await getAlbum(params.id) };
	} catch (e) {
		if (e instanceof DeezerError) {
			error(e.status === 404 ? 404 : 502, e.status === 404 ? 'Album not found' : e.message);
		}
		throw e;
	}
};
