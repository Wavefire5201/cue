// Typed client for the Deezer API, called straight from the visitor's browser (see `get`).
// Responses are mapped to the small shapes the UI needs.

export type RecordType = 'album' | 'ep' | 'single' | 'compile';

export interface ArtistSummary {
	id: number;
	name: string;
	picture: string | null;
	fans: number;
}

export interface AlbumSummary {
	id: number;
	title: string;
	artist: string;
	cover: string | null;
}

export interface Artist {
	id: number;
	name: string;
	picture: string | null;
	fans: number;
	albumCount: number;
	link: string;
}

export interface Release {
	id: number;
	title: string;
	cover: string | null;
	year: string;
	type: RecordType;
}

export interface Track {
	id: number;
	title: string;
	artist: string;
	duration: number;
	preview: string | null;
	explicit: boolean;
	disc: number;
	position: number;
	album: { id: number; title: string } | null;
}

export interface Album {
	id: number;
	title: string;
	type: RecordType;
	artist: { id: number; name: string };
	cover: string | null;
	releaseDate: string | null;
	label: string | null;
	genres: string[];
	duration: number;
	fans: number;
	tracks: Track[];
	link: string;
}

export class DeezerError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
	}
}

interface Page<T> {
	data: T[];
}

interface RawArtist {
	id: number;
	name: string;
	picture_medium: string;
	picture_xl: string;
	nb_fan: number;
	nb_album: number;
	link: string;
}

interface RawAlbum {
	id: number;
	title: string;
	cover_big: string;
	cover_xl: string;
	record_type: RecordType;
	release_date?: string;
	artist?: { id: number; name: string };
}

interface RawTrack {
	id: number;
	title: string;
	duration: number;
	preview: string;
	explicit_lyrics: boolean;
	disk_number?: number;
	track_position?: number;
	artist: { name: string };
	album?: { id: number; title: string };
}

const API = 'https://api.deezer.com/';
const TIMEOUT_MS = 10_000;
let requestId = 0;

// Deezer reports errors inside a normal response. https://developers.deezer.com/api/errors
function statusFor(code: number | undefined) {
	if (code === 800) return 404; // no data
	if (code === 4) return 429; // quota exceeded
	return 502;
}

/**
 * Deezer sends no CORS headers, so `fetch` from the browser is blocked. It does support JSONP:
 * the response is loaded as a <script> that calls a global function we name. So every visitor
 * talks to Deezer directly — their own IP and rate limit — and the app needs no server.
 */
function get<T>(
	path: string,
	params: Record<string, string | number> = {},
	signal?: AbortSignal
): Promise<T> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) return reject(signal.reason);

		const name = `__deezer${++requestId}`;
		const url = new URL(path, API);
		for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
		url.searchParams.set('output', 'jsonp');
		url.searchParams.set('callback', name);

		const globals = window as unknown as Record<string, (body: unknown) => void>;
		const script = document.createElement('script');

		const timer = setTimeout(
			() => settle(() => reject(new DeezerError('Deezer took too long to respond', 504))),
			TIMEOUT_MS
		);
		const onAbort = () => settle(() => reject(signal?.reason));

		function settle(finish: () => void) {
			clearTimeout(timer);
			signal?.removeEventListener('abort', onAbort);
			script.remove();
			// A script can't be cancelled once requested; if it still arrives, ignore it quietly.
			globals[name] = () => delete globals[name];
			finish();
		}

		globals[name] = (body) =>
			settle(() => {
				delete globals[name];
				const error = (body as { error?: { code?: number; message?: string } }).error;
				if (!error) return resolve(body as T);
				const status = statusFor(error.code);
				reject(
					new DeezerError(
						status === 404 ? 'Not found' : (error.message ?? 'Request failed'),
						status
					)
				);
			});
		script.onerror = () => settle(() => reject(new DeezerError('Couldn’t reach Deezer', 502)));
		signal?.addEventListener('abort', onAbort, { once: true });

		script.src = url.href;
		document.head.append(script);
	});
}

// Deezer serves a generic silhouette (empty hash in the URL) when there's no artwork.
const REAL_IMAGE = /\/images\/(artist|cover)\/[0-9a-f]{32}\//;

function image(url: string | undefined) {
	return url && REAL_IMAGE.test(url) ? url : null;
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
	const seen = new Set<string>();
	return items.filter((item) => {
		const k = key(item);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

function toArtistSummary(a: RawArtist): ArtistSummary {
	return { id: a.id, name: a.name, picture: image(a.picture_medium), fans: a.nb_fan ?? 0 };
}

function toTrack(t: RawTrack, i: number): Track {
	return {
		id: t.id,
		title: t.title,
		artist: t.artist.name,
		duration: t.duration,
		preview: t.preview || null,
		explicit: t.explicit_lyrics,
		disc: t.disk_number ?? 1,
		position: t.track_position ?? i + 1,
		album: t.album ? { id: t.album.id, title: t.album.title } : null
	};
}

interface SearchOptions {
	signal?: AbortSignal;
	limit?: number;
}

const normalize = (s: string) => s.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim();

export async function searchArtists(query: string, { signal, limit = 30 }: SearchOptions = {}) {
	const body = await get<Page<RawArtist>>('search/artist', { q: query, limit }, signal);
	const artists = body.data.map(toArtistSummary);

	// Deezer can rank a small namesake above the famous act ("muse" → an 11K-fan Muse before
	// the 5M-fan one). Put exact name matches first, most-followed first; keep Deezer's order
	// for everything else.
	const q = normalize(query);
	const exact = artists.filter((a) => normalize(a.name) === q).sort((a, b) => b.fans - a.fans);
	return [...exact, ...artists.filter((a) => normalize(a.name) !== q)];
}

export async function searchAlbums(query: string, { signal, limit = 30 }: SearchOptions = {}) {
	const body = await get<Page<RawAlbum>>('search/album', { q: query, limit }, signal);
	return body.data.map((a): AlbumSummary => ({
		id: a.id,
		title: a.title,
		artist: a.artist?.name ?? '',
		cover: image(a.cover_big)
	}));
}

export async function getArtist(id: string): Promise<Artist> {
	const a = await get<RawArtist>(`artist/${id}`);
	return {
		id: a.id,
		name: a.name,
		picture: image(a.picture_xl),
		fans: a.nb_fan ?? 0,
		albumCount: a.nb_album ?? 0,
		link: a.link
	};
}

export async function getTopTracks(id: string, limit = 10) {
	const body = await get<Page<RawTrack>>(`artist/${id}/top`, { limit });
	return body.data.map(toTrack);
}

/** Newest first. Deezer often lists clean and explicit editions separately; keep one. */
export async function getDiscography(id: string) {
	const body = await get<Page<RawAlbum>>(`artist/${id}/albums`, { limit: 200 });
	const releases = body.data.map((a): Release => ({
		id: a.id,
		title: a.title,
		cover: image(a.cover_big),
		year: a.release_date?.slice(0, 4) ?? '',
		type: a.record_type
	}));
	return uniqueBy(releases, (r) => `${r.type}:${r.title.toLowerCase()}`);
}

export async function getRelated(id: string, limit = 10) {
	const body = await get<Page<RawArtist>>(`artist/${id}/related`, { limit });
	return body.data.map(toArtistSummary);
}

export async function getAlbum(id: string): Promise<Album> {
	// The album object only embeds the first 25 tracks, so fetch the full list separately.
	const [a, tracks] = await Promise.all([
		get<
			RawAlbum & {
				label?: string;
				genres?: Page<{ name: string }>;
				duration: number;
				fans: number;
				link: string;
				artist: { id: number; name: string };
			}
		>(`album/${id}`),
		get<Page<RawTrack>>(`album/${id}/tracks`, { limit: 500 })
	]);

	return {
		id: a.id,
		title: a.title,
		type: a.record_type,
		artist: { id: a.artist.id, name: a.artist.name },
		cover: image(a.cover_xl),
		releaseDate: a.release_date && !a.release_date.startsWith('0000') ? a.release_date : null,
		label: a.label || null,
		genres: a.genres?.data.map((g) => g.name) ?? [],
		duration: a.duration ?? 0,
		fans: a.fans ?? 0,
		tracks: tracks.data.map(toTrack),
		link: a.link
	};
}
