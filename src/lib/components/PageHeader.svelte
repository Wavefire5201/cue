<script lang="ts">
	import { flushSync, type Snippet } from 'svelte';
	import BackLink from './BackLink.svelte';

	interface Props {
		eyebrow: string;
		title: string;
		/** Shown under the title in the compact header, e.g. an album's artist. */
		subtitle?: { label: string; href: string };
		/** Portrait or cover art. Rendered in the hero and again, small, in the compact header. */
		media: Snippet;
		children?: Snippet;
	}

	let { eyebrow, title, subtitle, media, children }: Props = $props();

	let header: HTMLElement;
	let heroMedia: HTMLElement;
	let heroText: HTMLElement;
	let heroTitle: HTMLElement;
	let compactMedia: HTMLElement | undefined = $state();
	let compactTitle: HTMLElement | undefined = $state();
	/** True once the hero image has mostly scrolled off the top of the screen. */
	let compact = $state(false);

	const DURATION = 600;
	const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
	let running: Animation[] = [];

	/**
	 * FLIP: draw `el` at its previous on-screen position, then let it glide into place. One real
	 * element moves (no snapshots, no crossfade). When expanding, the animated element is the hero
	 * itself, so it lands correctly even if the page is still scrolling.
	 */
	function glide(el: HTMLElement, from: DOMRect, scale: number) {
		const to = el.getBoundingClientRect();
		if (!to.width || !from.width) return;
		el.classList.add('flying');
		const animation = el.animate(
			[
				{
					transformOrigin: 'top left',
					transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`
				},
				{ transformOrigin: 'top left', transform: 'none' }
			],
			{ duration: DURATION, easing: EASING }
		);
		animation.finished.then(
			() => el.classList.remove('flying'),
			() => el.classList.remove('flying')
		);
		running.push(animation);
	}

	const fontSize = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize);

	function setCompact(next: boolean) {
		if (next === compact) return;

		const [fromMedia, fromTitle] = next ? [heroMedia, heroTitle] : [compactMedia, compactTitle];
		if (!fromMedia || !fromTitle || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			compact = next;
			return;
		}

		// First: where the image and title are drawn right now (mid-animation included).
		const mediaRect = fromMedia.getBoundingClientRect();
		const titleRect = fromTitle.getBoundingClientRect();
		const titleSize = fontSize(fromTitle);
		running.forEach((a) => a.cancel());
		running = [];

		// Last: swap states synchronously so the new elements can be measured.
		flushSync(() => (compact = next));

		const [toMedia, toTitle] = next ? [compactMedia, compactTitle] : [heroMedia, heroTitle];
		if (!toMedia || !toTitle) return;
		glide(toMedia, mediaRect, mediaRect.width / toMedia.getBoundingClientRect().width);
		glide(toTitle, titleRect, titleSize / fontSize(toTitle));
	}

	// Start the move while the image is still partly on screen, so it visibly travels to the
	// compact header. The gap between the two ratios stops it flickering around one threshold.
	const COLLAPSE_BELOW = 0.4;
	const EXPAND_ABOVE = 0.6;

	$effect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				const offTop = entry.boundingClientRect.top < 0;
				if (!compact && offTop && entry.intersectionRatio < COLLAPSE_BELOW) setCompact(true);
				else if (compact && (!offTop || entry.intersectionRatio > EXPAND_ABOVE)) setCompact(false);
			},
			{ threshold: [0, 0.2, COLLAPSE_BELOW, EXPAND_ABOVE, 0.8, 1] }
		);
		observer.observe(heroMedia);
		return () => observer.disconnect();
	});

	// Long titles shrink just enough for the text column to fit beside the image, instead of
	// growing taller than it. Short titles keep the full size; below the floor the text wraps.
	const MIN_TITLE_PX = 32;

	function fitTitle() {
		if (!heroTitle) return;
		heroTitle.style.fontSize = '';
		heroTitle.style.letterSpacing = '';
		// Stacked layout on narrow screens: nothing to fit beside.
		if (matchMedia('(max-width: 640px)').matches) return;

		const limit = heroMedia.offsetHeight;
		if (heroText.offsetHeight <= limit) return;

		// Binary search for the largest size that fits.
		let lo = MIN_TITLE_PX;
		let hi = parseFloat(getComputedStyle(heroTitle).fontSize);
		for (let i = 0; i < 8; i++) {
			const mid = (lo + hi) / 2;
			heroTitle.style.fontSize = `${mid}px`;
			if (heroText.offsetHeight <= limit) lo = mid;
			else hi = mid;
		}
		heroTitle.style.fontSize = `${Math.floor(lo)}px`;
		// The display-size tracking reads as cramped once the title has shrunk a lot.
		if (lo < 56) heroTitle.style.letterSpacing = '-0.03em';
	}

	$effect(() => {
		void title;
		let width = 0;
		const observer = new ResizeObserver(([entry]) => {
			// Only width changes matter; fitting itself changes the height.
			if (entry.contentRect.width === width) return;
			width = entry.contentRect.width;
			fitTitle();
		});
		observer.observe(header);
		// Re-fit once Inter has loaded, since the fallback font measures differently.
		document.fonts.ready.then(fitTitle);
		return () => observer.disconnect();
	});
</script>

<BackLink iconOnly />

<header bind:this={header}>
	<!-- While compact, the originals hide so the image and title move rather than duplicate. -->
	<div class="media" class:moved={compact} bind:this={heroMedia}>
		{@render media()}
	</div>
	<div class="text" bind:this={heroText}>
		<p class="label">{eyebrow}</p>
		<h1 class:moved={compact} bind:this={heroTitle}>{title}</h1>
		{@render children?.()}
	</div>
</header>

{#if compact}
	<aside class="compact" aria-label="Current page">
		<BackLink iconOnly />
		<div class="compact-body">
			<div class="compact-media" bind:this={compactMedia}>{@render media()}</div>
			<div class="compact-text">
				<p class="compact-title" bind:this={compactTitle}>{title}</p>
				{#if subtitle}
					<a class="compact-sub" href={subtitle.href}>{subtitle.label}</a>
				{/if}
			</div>
		</div>
	</aside>
{/if}

<style>
	header {
		display: grid;
		grid-template-columns: var(--media-size, 220px) minmax(0, 1fr);
		align-items: end;
		gap: clamp(28px, 5vw, 56px);
		margin-top: 32px;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-width: 0;
	}

	.label {
		margin-bottom: -8px;
	}

	h1 {
		font-size: clamp(2.5rem, 7vw, 5.25rem);
		font-weight: 250;
		letter-spacing: -0.045em;
		line-height: 0.98;
		text-wrap: balance;
		overflow-wrap: anywhere;
	}

	.compact {
		position: fixed;
		z-index: 15;
		display: flex;
	}

	.moved {
		visibility: hidden;
	}

	/* keep a moving element above the content it passes over (class set from glide()) */
	:global(.flying) {
		position: relative;
		z-index: 20;
		will-change: transform;
	}

	.compact-body {
		display: flex;
		min-width: 0;
	}

	.compact-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.compact-sub {
		font-size: 0.875rem;
		color: var(--muted);
		transition: color 0.15s;
	}

	.compact-sub:hover {
		color: var(--text);
	}

	/* The image and title glide in; the back link and subtitle fade in alongside them. */
	.compact > :global(a),
	.compact-sub {
		animation: fade-in 0.4s var(--ease) 0.2s both;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	.compact-title {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* Room in the left margin: a vertical stack, back link on top. */
	@media (min-width: 1360px) {
		.compact {
			top: 64px;
			left: 24px;
			width: calc((100vw - var(--max)) / 2 - 48px);
			flex-direction: column;
			align-items: flex-start;
			gap: 28px;
		}

		.compact-body {
			flex-direction: column;
			gap: 16px;
		}

		.compact-media {
			width: 88px;
		}

		.compact-title {
			font-size: 1.25rem;
			letter-spacing: -0.025em;
			line-height: 1.2;
		}
	}

	/* No room beside the content: a bar across the top instead. */
	@media (max-width: 1359px) {
		.compact {
			inset: 0 0 auto;
			align-items: center;
			gap: 20px;
			padding: 10px max(var(--gutter), calc((100vw - var(--max)) / 2));
			background: var(--bg);
			border-bottom: 1px solid var(--line);
		}

		.compact-body {
			align-items: center;
			gap: 12px;
		}

		.compact-media {
			flex: none;
			width: 32px;
		}

		.compact-text {
			gap: 0;
		}

		.compact-title,
		.compact-sub {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.compact-title {
			font-size: 0.9375rem;
			line-height: 1.3;
		}

		.compact-sub {
			font-size: 0.8125rem;
		}
	}

	@media (max-width: 640px) {
		header {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.media {
			width: min(var(--media-size, 220px), 70%);
		}
	}
</style>
