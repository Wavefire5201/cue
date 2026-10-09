<script lang="ts">
	import Cover from './Cover.svelte';
	import { albumPath } from '#lib/paths.js';

	interface Props {
		id: number;
		title: string;
		cover: string | null;
		/** Secondary line, e.g. the artist or release year. */
		detail: string;
	}

	let { id, title, cover, detail }: Props = $props();
</script>

<a class="card" href={albumPath(id)}>
	<Cover src={cover} />
	<span class="name">{title}</span>
	<span class="detail">{detail}</span>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.card :global(.cover) {
		margin-bottom: 12px;
		transition: transform 0.3s var(--ease);
	}

	.card:hover :global(.cover) {
		transform: translateY(-3px);
	}

	.name,
	.detail {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.35;
	}

	.detail {
		font-size: 0.875rem;
		color: var(--muted);
	}
</style>
