<script lang="ts">
	interface Props {
		src: string | null;
		alt?: string;
		/** Load immediately rather than when scrolled near. */
		eager?: boolean;
	}

	let { src, alt = '', eager = false }: Props = $props();

	let loaded = $state(false);
	let failed = $state(false);
	let instant = $state(false);
	$effect.pre(() => {
		void src;
		loaded = false;
		failed = false;
		instant = false;
	});

	// Images already in memory (e.g. the compact header's copy) show at once instead of fading.
	function showIfCached(img: HTMLImageElement) {
		void src;
		if (img.complete && img.naturalWidth > 0) {
			instant = true;
			loaded = true;
		}
	}
</script>

<div class="cover" class:loaded class:instant>
	{#if src && !failed}
		<img
			{src}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			onload={() => (loaded = true)}
			onerror={() => (failed = true)}
			{@attach showIfCached}
		/>
	{:else}
		<svg viewBox="0 0 40 40" aria-hidden="true">
			<circle cx="20" cy="20" r="11" />
			<circle cx="20" cy="20" r="2.5" />
		</svg>
	{/if}
</div>

<style>
	.cover {
		position: relative;
		aspect-ratio: 1;
		width: 100%;
		overflow: hidden;
		background: var(--surface);
	}

	/* hairline so pale covers don't dissolve into the page */
	.cover::after {
		content: '';
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 0 1px var(--shade);
		pointer-events: none;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.4s var(--ease);
	}

	.loaded img {
		opacity: 1;
	}

	.instant img {
		transition: none;
	}

	svg {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 36%;
		fill: none;
		stroke: var(--faint);
		stroke-width: 0.75;
	}
</style>
