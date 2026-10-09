import { error } from '@sveltejs/kit';
import { DeezerError, getArtist, getDiscography, getRelated, getTopTracks } from '#lib/deezer.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (!/^\d+$/.test(params.id)) error(404, 'Artist not found');

	try {
		// Everything but the artist itself is nice-to-have; don't fail the page over it.
		const [artist, tracks, releases, related] = await Promise.all([
			getArtist(params.id),
			getTopTracks(params.id).catch(() => []),
			getDiscography(params.id).catch(() => []),
			getRelated(params.id).catch(() => [])
		]);

		return {
			artist,
			tracks,
			albums: releases.filter((r) => r.type === 'album' || r.type === 'compile'),
			singles: releases.filter((r) => r.type === 'single' || r.type === 'ep'),
			related
		};
	} catch (e) {
		if (e instanceof DeezerError) {
			error(e.status === 404 ? 404 : 502, e.status === 404 ? 'Artist not found' : e.message);
		}
		throw e;
	}
};
