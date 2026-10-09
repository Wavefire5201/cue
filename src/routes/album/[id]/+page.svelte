<script lang="ts">
	import Cover from '#lib/components/Cover.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Section from '#lib/components/Section.svelte';
	import Stats from '#lib/components/Stats.svelte';
	import TagList from '#lib/components/TagList.svelte';
	import TrackList from '#lib/components/TrackList.svelte';
	import { long, recordType, releaseDate, totalDuration } from '#lib/format.js';
	import type { Track } from '#lib/deezer.js';
	import { artistPath } from '#lib/paths.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const album = $derived(data.album);

	const stats = $derived([
		...(album.releaseDate ? [{ label: 'Released', value: releaseDate(album.releaseDate) }] : []),
		{ label: 'Tracks', value: String(album.tracks.length) },
		...(album.duration ? [{ label: 'Length', value: totalDuration(album.duration) }] : []),
		{ label: 'Fans', value: long(album.fans) }
	]);

	// Group multi-disc releases; a single disc renders as one plain list.
	const discs = $derived.by(() => {
		const byDisc = new Map<number, Track[]>();
		for (const track of album.tracks) {
			byDisc.set(track.disc, [...(byDisc.get(track.disc) ?? []), track]);
		}
		return [...byDisc].sort(([a], [b]) => a - b).map(([disc, tracks]) => ({ disc, tracks }));
	});
</script>

<svelte:head>
	<title>{album.title} by {album.artist.name}</title>
</svelte:head>

<article style:--media-size="300px">
	<PageHeader
		eyebrow={recordType(album.type)}
		title={album.title}
		subtitle={{ label: album.artist.name, href: artistPath(album.artist.id) }}
	>
		{#snippet media()}
			<Cover src={album.cover} alt="{album.title} cover art" eager />
		{/snippet}

		<p class="by">
			by <a href={artistPath(album.artist.id)}>{album.artist.name}</a>
		</p>
		<Stats items={stats} />
		<TagList tags={album.genres} />
	</PageHeader>

	<Section title="Tracklist">
		{#if album.tracks.length}
			{#each discs as { disc, tracks } (disc)}
				{#if discs.length > 1}
					<h3 class="label disc">Disc {disc}</h3>
				{/if}
				<TrackList
					{tracks}
					numbering="position"
					secondary={(track) => (track.artist !== album.artist.name ? track.artist : null)}
				/>
			{/each}
		{:else}
			<p class="empty">Deezer doesn’t have a tracklist for this release.</p>
		{/if}

		{#if album.label}
			<p class="credit">℗ {album.label}</p>
		{/if}
	</Section>

	<a class="source-link" href={album.link} target="_blank" rel="external noopener">
		{album.title} on Deezer ↗
	</a>
</article>

<style>
	.by {
		margin-top: -8px;
		font-size: 1.25rem;
		color: var(--muted);
	}

	.by a {
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--line);
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
		transition: text-decoration-color 0.15s;
	}

	.by a:hover {
		text-decoration-color: currentColor;
	}

	.disc {
		margin-bottom: 12px;
	}

	:global(ol) + .disc {
		margin-top: 40px;
	}

	.empty {
		color: var(--muted);
	}

	.credit {
		margin-top: 24px;
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
