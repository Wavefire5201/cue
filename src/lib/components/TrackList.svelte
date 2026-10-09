<script lang="ts">
	import type { Track } from '#lib/deezer.js';
	import { duration } from '#lib/format.js';
	import { player } from '#lib/state/player.svelte.js';

	interface Props {
		tracks: Track[];
		/** Number by album track position instead of list order. */
		numbering?: 'rank' | 'position';
		/** Optional second line under the title. */
		secondary?: (track: Track) => string | null;
	}

	let { tracks, numbering = 'rank', secondary }: Props = $props();
</script>

<ol>
	{#each tracks as track, i (i)}
		{@const active = player.current?.id === track.id}
		{@const playing = active && player.playing}
		{@const n = numbering === 'position' ? track.position : i + 1}
		{@const sub = secondary?.(track)}
		<li class:active class:playable={!!track.preview}>
			{#if track.preview}
				<button
					type="button"
					class="lead"
					aria-label="{playing ? 'Pause' : 'Play'} preview of {track.title}"
					onclick={() => player.toggle(track)}
				>
					<span class="n num">{n}</span>
					<svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
						{#if playing}
							<path d="M5 3.5v9M11 3.5v9" />
						{:else}
							<path d="M4.2 3.2v9.6L11.8 8z" />
						{/if}
					</svg>
				</button>
			{:else}
				<span class="lead"><span class="n num">{n}</span></span>
			{/if}

			<span class="text">
				<span class="title">
					{track.title}
					{#if track.explicit}<abbr class="explicit" title="Explicit">E</abbr>{/if}
				</span>
				{#if sub}<span class="sub">{sub}</span>{/if}
			</span>

			<span class="time num">{duration(track.duration)}</span>

			{#if active}
				<span class="progress" style:transform="scaleX({player.progress})" aria-hidden="true"
				></span>
			{/if}
		</li>
	{/each}
</ol>

<style>
	li {
		position: relative;
		display: grid;
		/* the 16px icon sits centred in a 20px column, so the space either side of it matches */
		grid-template-columns: 20px minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		margin-inline: -16px;
		transition: background-color 0.15s;
	}

	li + li::before {
		content: '';
		position: absolute;
		inset: 0 16px auto;
		height: 1px;
		background: var(--line);
	}

	li.playable:hover,
	li.active {
		background: var(--surface);
	}

	li.playable:hover::before,
	li.playable:hover + li::before,
	li.active::before,
	li.active + li::before {
		opacity: 0;
	}

	.lead {
		display: grid;
		place-items: center;
		height: 20px;
		color: var(--muted);
	}

	/* the whole row is the hit area, so it also carries the focus ring */
	button.lead::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	button.lead:focus-visible {
		outline: none;
	}

	li:has(.lead:focus-visible) {
		outline: 1.5px solid var(--text);
		outline-offset: -1.5px;
	}

	.n {
		font-size: 0.875rem;
	}

	.icon {
		display: none;
		width: 16px;
		fill: currentColor;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	li.playable:hover .n,
	li.active .n {
		display: none;
	}

	li.playable:hover .icon,
	li.active .icon {
		display: block;
		color: var(--text);
	}

	.text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.title,
	.sub {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sub {
		font-size: 0.8125rem;
		color: var(--muted);
	}

	.explicit {
		display: inline-grid;
		place-items: center;
		width: 15px;
		height: 15px;
		margin-left: 4px;
		background: var(--line);
		font-size: 0.5625rem;
		font-weight: 500;
		color: var(--muted);
		text-decoration: none;
		vertical-align: 2px;
	}

	.time {
		font-size: 0.875rem;
		color: var(--muted);
	}

	.progress {
		position: absolute;
		inset: auto 0 0;
		height: 2px;
		background: var(--text);
		transform-origin: left;
		transition: transform 0.25s linear;
	}
</style>
