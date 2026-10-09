import { searchAlbums, searchArtists, type AlbumSummary, type ArtistSummary } from '#lib/deezer.js';

export type SearchKind = 'artists' | 'albums';

export type SearchResults =
	| { kind: 'artists'; query: string; items: ArtistSummary[] }
	| { kind: 'albums'; query: string; items: AlbumSummary[] };

/**
 * App-wide search state. It lives at module level (safe here because the app renders
 * client-side only), so results survive a trip to a detail page and back without a refetch,
 * which also lets the router restore the scroll position.
 */
class SearchState {
	/** The trimmed query currently shown or being loaded. */
	query = $state('');
	kind = $state<SearchKind>('artists');
	results = $state.raw<SearchResults | null>(null);
	loading = $state(false);
	error = $state<string | null>(null);

	#cache = new Map<string, SearchResults>();
	#controller: AbortController | null = null;

	async run(rawQuery: string, kind: SearchKind, { force = false } = {}) {
		const query = rawQuery.trim();
		if (!force && query === this.query && kind === this.kind && !this.error) return;

		this.query = query;
		this.kind = kind;
		this.error = null;
		this.#controller?.abort();
		this.#controller = null;

		if (!query) {
			this.results = null;
			this.loading = false;
			return;
		}

		const key = `${kind}:${query.toLowerCase()}`;
		const cached = this.#cache.get(key);
		if (cached) {
			this.results = cached;
			this.loading = false;
			return;
		}

		const controller = new AbortController();
		this.#controller = controller;
		this.loading = true;

		try {
			const { signal } = controller;
			const results: SearchResults =
				kind === 'artists'
					? { kind, query, items: await searchArtists(query, { signal }) }
					: { kind, query, items: await searchAlbums(query, { signal }) };
			this.#cache.set(key, results);
			this.results = results;
		} catch (e) {
			if (controller.signal.aborted) return;
			this.error = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			if (this.#controller === controller) {
				this.#controller = null;
				this.loading = false;
			}
		}
	}

	retry() {
		return this.run(this.query, this.kind, { force: true });
	}
}

export const search = new SearchState();
