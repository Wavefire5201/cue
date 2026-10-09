<script lang="ts">
	import AlbumCard from './AlbumCard.svelte';
	import type { Release } from '#lib/deezer.js';
	import { recordType } from '#lib/format.js';

	interface Props {
		releases: Release[];
		/** How many to show before "Show all". */
		limit?: number;
		/** Mention the record type (EP, Single…) next to the year. */
		showType?: boolean;
	}

	let { releases, limit = 12, showType = false }: Props = $props();

	let expanded = $state(false);
	const shown = $derived(expanded ? releases : releases.slice(0, limit));

	function detail(release: Release) {
		const parts = [release.year, showType ? recordType(release.type) : ''];
		return parts.filter(Boolean).join(' · ');
	}
</script>

<ul>
	{#each shown as release (release.id)}
		<li>
			<AlbumCard
				id={release.id}
				title={release.title}
				cover={release.cover}
				detail={detail(release)}
			/>
		</li>
	{/each}
</ul>

{#if releases.length > limit}
	<button type="button" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
		{expanded ? 'Show fewer' : `Show all ${releases.length}`}
	</button>
{/if}

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 36px 24px;
	}

	button {
		margin-top: 32px;
		padding: 8px 18px;
		border: 1px solid var(--line);
		font-size: 0.875rem;
		font-weight: 400;
		transition: border-color 0.15s;
	}

	button:hover {
		border-color: var(--muted);
	}

	@media (max-width: 640px) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 28px 16px;
		}
	}
</style>
