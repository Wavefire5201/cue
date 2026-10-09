<script lang="ts">
	import '@fontsource-variable/inter/opsz.css';
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/state';
	import NowPlaying from '#lib/components/NowPlaying.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Crossfade between pages; typing in search (same route) is left alone.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.route.id === navigation.to?.route.id) return;

		return new Promise((done) => {
			document.startViewTransition(async () => {
				done();
				await navigation.complete;
			});
		});
	});
</script>

{#if navigating.to}
	<div class="progress" aria-hidden="true"></div>
{/if}

<main>
	{@render children()}
</main>

<footer>
	<p>Data and previews from <a href="https://www.deezer.com" rel="external noopener">Deezer</a>.</p>
	<ThemeToggle />
</footer>

<NowPlaying />

<style>
	main,
	footer {
		width: 100%;
		max-width: calc(var(--max) + var(--gutter) * 2);
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	main {
		padding-block: clamp(48px, 10vw, 120px) 96px;
		min-height: calc(100dvh - 160px);
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-block: 32px 40px;
		font-size: 0.8125rem;
		color: var(--faint);
	}

	footer a {
		color: var(--muted);
		text-decoration: underline;
		text-decoration-color: var(--line);
		text-underline-offset: 3px;
	}

	footer a:hover {
		color: var(--text);
	}

	.progress {
		position: fixed;
		inset: 0 0 auto;
		height: 2px;
		z-index: 30;
		background: var(--text);
		transform-origin: left;
		animation: progress 1.6s var(--ease) 150ms both;
	}

	@keyframes progress {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(0.85);
		}
	}
</style>
