<script lang="ts">
	interface Props {
		name: string;
		src: string | null;
	}

	let { name, src }: Props = $props();

	const initial = $derived(name.replace(/^the\s+/i, '').match(/[\p{L}\p{N}]/u)?.[0] ?? '·');

	let loaded = $state(false);
	let instant = $state(false);
	$effect.pre(() => {
		void src;
		loaded = false;
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

<div class="avatar" class:loaded class:instant>
	<span class="initial" aria-hidden="true">{initial}</span>
	{#if src}
		<img {src} alt="" onload={() => (loaded = true)} {@attach showIfCached} />
	{/if}
</div>

<style>
	.avatar {
		position: relative;
		aspect-ratio: 1;
		width: 100%;
		border-radius: 50%;
		overflow: hidden;
		background: var(--surface);
		container-type: inline-size;
	}

	.initial {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 42cqi;
		font-weight: 250;
		line-height: 1;
		color: var(--faint);
		text-transform: uppercase;
		transition: opacity 0.3s;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.4s var(--ease);
	}

	.loaded img {
		opacity: 1;
	}

	.loaded .initial {
		opacity: 0;
	}

	.instant img,
	.instant .initial {
		transition: none;
	}
</style>
