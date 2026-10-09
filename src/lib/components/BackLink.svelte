<script lang="ts">
	import { resolve } from '$app/paths';
	import { search } from '#lib/state/search.svelte.js';

	/** Arrow only, larger; the label is kept for screen readers. */
	let { iconOnly = false }: { iconOnly?: boolean } = $props();

	// Return to whatever was last searched, so the results (and scroll) are still there.
	const href = $derived.by(() => {
		const params = new URLSearchParams();
		if (search.query) params.set('q', search.query);
		if (search.kind === 'albums') params.set('type', 'albums');
		const query = params.toString();
		return resolve('/') + (query ? `?${query}` : '');
	});

	const label = $derived(search.query ? 'Back to results' : 'Search');
</script>

<a {href} class:icon-only={iconOnly} aria-label={iconOnly ? label : undefined}>
	<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" /></svg>
	{#if !iconOnly}{label}{/if}
</a>

<style>
	a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: var(--muted);
		transition: color 0.15s;
	}

	a:hover {
		color: var(--text);
	}

	svg {
		width: 14px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
	}

	.icon-only {
		padding-block: 6px;
	}

	.icon-only svg {
		width: 24px;
		stroke-width: 1.1;
	}
</style>
