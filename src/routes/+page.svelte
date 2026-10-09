<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AlbumCard from '#lib/components/AlbumCard.svelte';
	import ArtistRow from '#lib/components/ArtistRow.svelte';
	import KindToggle from '#lib/components/KindToggle.svelte';
	import ListSkeleton from '#lib/components/ListSkeleton.svelte';
	import SearchField from '#lib/components/SearchField.svelte';
	import { albumPath, artistPath } from '#lib/paths.js';
	import { search, type SearchKind } from '#lib/state/search.svelte.js';

	// Quick picks for the empty state, linked straight to their pages by Deezer ID (searching
	// "Muse" alone surfaces a different, smaller Muse first). Each album is that artist's most-
	// followed album on Deezer.
	const SUGGESTIONS: Record<SearchKind, { label: string; href: string }[]> = {
		artists: [
			{ label: 'The Marías', href: artistPath(12607183) },
			{ label: 'Muse', href: artistPath(705) },
			{ label: 'Tokyo Tea Room', href: artistPath(10888470) },
			{ label: 'Last Dinosaurs', href: artistPath(317504) },
			{ label: 'Electric Guest', href: artistPath(1572322) },
			{ label: 'Linkin Park', href: artistPath(92) }
		],
		albums: [
			{ label: 'Submarine', href: albumPath(591265602) },
			{ label: 'The Resistance', href: albumPath(390984) },
			{ label: 'No Rush', href: albumPath(651818331) },
			{ label: 'Wellness', href: albumPath(10974154) },
			{ label: 'Mondo', href: albumPath(6527260) },
			{ label: 'Hybrid Theory', href: albumPath(81763) }
		]
	};

	// The URL is the source of truth for what's searched: it survives reloads and can be shared.
	const q = $derived(page.url.searchParams.get('q') ?? '');
	const kind: SearchKind = $derived(
		page.url.searchParams.get('type') === 'albums' ? 'albums' : 'artists'
	);

	// `pre` so the store is updated before the first paint (no flash of the empty state).
	$effect.pre(() => {
		const [query, k] = [q, kind];
		untrack(() => search.run(query, k));
	});

	// The input keeps its own draft so typing never waits on the router. It re-syncs from the
	// URL on every navigation except our own debounced `goto`s (back/forward, links, logo).
	let draft = $state(page.url.searchParams.get('q') ?? '');
	let field: SearchField;
	let timer: ReturnType<typeof setTimeout> | undefined;

	afterNavigate(({ type }) => {
		if (type !== 'goto') draft = q;
	});

	onMount(() => {
		if (!q && matchMedia('(hover: hover)').matches) field.focus();
		return () => clearTimeout(timer);
	});

	function href(query: string, k: SearchKind) {
		const params = new URLSearchParams();
		if (query.trim()) params.set('q', query);
		if (k === 'albums') params.set('type', 'albums');
		const s = params.toString();
		return resolve('/') + (s ? `?${s}` : '');
	}

	function commit(query = draft, k = kind) {
		clearTimeout(timer);
		goto(href(query, k), { replace: true, reset: false });
	}

	function oninput() {
		clearTimeout(timer);
		timer = setTimeout(() => commit(), 280);
	}

	const results = $derived(search.results);
	// Keep old results on screen (dimmed) while a new query loads, unless they're the wrong kind.
	const showResults = $derived(results !== null && results.kind === kind);
	const noun = $derived(kind === 'artists' ? 'artist' : 'album');

	const status = $derived.by(() => {
		if (!search.query) return '';
		if (search.loading) return 'Searching…';
		if (search.error || !results) return '';
		const n = results.items.length;
		return n === 0 ? 'No results' : `${n} ${noun}${n === 1 ? '' : 's'}`;
	});
</script>

<svelte:head>
	<title>{search.query ? `${search.query} · Cue` : 'Cue'}</title>
</svelte:head>

<section class="search">
	<SearchField
		bind:this={field}
		bind:value={draft}
		placeholder={kind === 'artists' ? 'Search artists' : 'Search albums'}
		loading={search.loading}
		{oninput}
		onsubmit={() => commit()}
		onclear={() => {
			draft = '';
			commit();
		}}
	/>
	<div class="bar">
		<KindToggle value={kind} onchange={(k) => commit(draft, k)} />
		<p class="status num" aria-live="polite">{status}</p>
	</div>
</section>

{#if search.error}
	<div class="message">
		<p>Couldn’t load results.</p>
		<p class="detail">{search.error}</p>
		<button type="button" onclick={() => search.retry()}>Try again</button>
	</div>
{:else if !search.query}
	<div class="intro">
		<p class="label">Try</p>
		<ul class="suggestions">
			{#each SUGGESTIONS[kind] as suggestion (suggestion.href)}
				<li><a href={suggestion.href}>{suggestion.label}</a></li>
			{/each}
		</ul>
	</div>
{:else if !showResults || !results}
	<ListSkeleton {kind} />
{:else if results.items.length === 0}
	<div class="message">
		<p>No {noun}s match “{results.query}”.</p>
		<p class="detail">
			Check the spelling, or try searching {kind === 'artists' ? 'albums' : 'artists'} instead.
		</p>
	</div>
{:else}
	<div class="results" class:stale={search.loading}>
		{#if results.kind === 'artists'}
			<ul class="artists">
				{#each results.items as artist (artist.id)}
					<li>
						<ArtistRow
							id={artist.id}
							name={artist.name}
							picture={artist.picture}
							fans={artist.fans}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="albums">
				{#each results.items as album (album.id)}
					<li>
						<AlbumCard
							id={album.id}
							title={album.title}
							cover={album.cover}
							detail={album.artist}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.search {
		margin-bottom: 40px;
	}

	.bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-top: 20px;
	}

	.status {
		font-size: 0.875rem;
		color: var(--muted);
	}

	.results {
		transition: opacity 0.2s;
	}

	.results.stale {
		opacity: 0.45;
	}

	.artists li + li {
		border-top: 1px solid var(--line);
	}

	.albums {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 36px 24px;
	}

	@media (max-width: 520px) {
		.albums {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 28px 16px;
		}
	}

	.intro {
		padding-top: 24px;
	}

	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 28px;
		margin-top: 12px;
	}

	.suggestions a {
		font-size: clamp(1.25rem, 3vw, 1.625rem);
		font-weight: 250;
		letter-spacing: -0.02em;
		color: var(--muted);
		transition: color 0.15s;
	}

	.suggestions a:hover {
		color: var(--text);
	}

	.message {
		padding-top: 24px;
		font-size: 1.125rem;
	}

	.message .detail {
		margin-top: 4px;
		font-size: 0.9375rem;
		color: var(--muted);
	}

	.message button {
		margin-top: 20px;
		padding: 8px 18px;
		border: 1px solid var(--line);
		font-size: 0.875rem;
		font-weight: 400;
		transition:
			border-color 0.15s,
			background-color 0.15s;
	}

	.message button:hover {
		border-color: var(--muted);
	}
</style>
