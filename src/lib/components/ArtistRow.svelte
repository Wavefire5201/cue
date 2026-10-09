<script lang="ts">
	import ArtistAvatar from './ArtistAvatar.svelte';
	import { short } from '#lib/format.js';
	import { artistPath } from '#lib/paths.js';

	interface Props {
		id: number;
		name: string;
		picture: string | null;
		fans: number;
	}

	let { id, name, picture, fans }: Props = $props();
</script>

<a class="row" href={artistPath(id)}>
	<span class="avatar"><ArtistAvatar {name} src={picture} /></span>
	<span class="name">{name}</span>
	<span class="fans num">{short(fans)} <span class="unit">{fans === 1 ? 'fan' : 'fans'}</span></span
	>
	<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) auto 16px;
		align-items: center;
		gap: 16px;
		padding: 10px 12px;
		margin-inline: -12px;
		transition: background-color 0.15s;
	}

	.row:hover {
		background: var(--surface);
	}

	.name {
		font-size: 1.0625rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.fans {
		font-size: 0.875rem;
		color: var(--muted);
	}

	.arrow {
		width: 16px;
		fill: none;
		stroke: var(--muted);
		stroke-width: 1.25;
		opacity: 0;
		transform: translateX(-4px);
		transition:
			opacity 0.15s,
			transform 0.2s var(--ease);
	}

	.row:hover .arrow,
	.row:focus-visible .arrow {
		opacity: 1;
		transform: none;
	}

	@media (max-width: 520px) {
		.row {
			grid-template-columns: 40px minmax(0, 1fr) auto;
			gap: 14px;
		}

		.arrow {
			display: none;
		}
	}
</style>
