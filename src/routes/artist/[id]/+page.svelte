<script lang="ts">
	import ArtistAvatar from '#lib/components/ArtistAvatar.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import ReleaseGrid from '#lib/components/ReleaseGrid.svelte';
	import Section from '#lib/components/Section.svelte';
	import Stats from '#lib/components/Stats.svelte';
	import TrackList from '#lib/components/TrackList.svelte';
	import { long } from '#lib/format.js';
	import { artistPath } from '#lib/paths.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const artist = $derived(data.artist);
</script>

<svelte:head>
	<title>{artist.name} · Cue</title>
</svelte:head>

<article style:--media-size="220px">
	<PageHeader eyebrow="Artist" title={artist.name}>
		{#snippet media()}
			<ArtistAvatar name={artist.name} src={artist.picture} />
		{/snippet}

		<Stats
			items={[
				{ label: 'Fans', value: long(artist.fans) },
				{ label: 'Releases', value: long(artist.albumCount) }
			]}
		/>
	</PageHeader>

	{#if data.tracks.length}
		<Section title="Popular tracks">
			<TrackList tracks={data.tracks} secondary={(track) => track.album?.title ?? null} />
		</Section>
	{/if}

	{#if data.albums.length}
		<Section title="Albums">
			<ReleaseGrid releases={data.albums} />
		</Section>
	{/if}

	{#if data.singles.length}
		<Section title="Singles & EPs">
			<ReleaseGrid releases={data.singles} limit={6} showType />
		</Section>
	{/if}

	{#if data.related.length}
		<Section title="Fans also like">
			<ul class="related">
				{#each data.related as related (related.id)}
					<li>
						<a href={artistPath(related.id)}>
							<ArtistAvatar name={related.name} src={related.picture} />
							<span>{related.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<a class="source-link" href={artist.link} target="_blank" rel="external noopener">
		{artist.name} on Deezer ↗
	</a>
</article>

<style>
	.related {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
		gap: 28px 24px;
	}

	.related a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
		font-size: 0.9375rem;
	}

	.related a :global(.avatar) {
		transition: transform 0.3s var(--ease);
	}

	.related a:hover :global(.avatar) {
		transform: translateY(-3px);
	}

	@media (max-width: 640px) {
		.related {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 24px 16px;
		}
	}
</style>
