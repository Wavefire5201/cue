<script lang="ts">
	import { flushSync, onMount } from 'svelte';

	type Theme = 'light' | 'dark';

	// Starts from the saved choice (set on <html> by app.html) or the system setting.
	let theme = $state<Theme>('light');
	// Off until the real theme is known, so the icon doesn't animate on page load.
	let animate = $state(false);
	const id = $props.id();

	onMount(() => {
		const saved = document.documentElement.dataset.theme;
		const system = matchMedia('(prefers-color-scheme: dark)');
		theme = saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light';

		// Follow the system while the user hasn't picked a theme themselves.
		const follow = (e: MediaQueryListEvent) => {
			if (!document.documentElement.dataset.theme) theme = e.matches ? 'dark' : 'light';
		};
		system.addEventListener('change', follow);
		requestAnimationFrame(() => (animate = true));
		return () => system.removeEventListener('change', follow);
	});

	function toggle() {
		const next: Theme = theme === 'dark' ? 'light' : 'dark';
		const apply = () => {
			theme = next;
			document.documentElement.dataset.theme = next;
		};

		try {
			localStorage.setItem('theme', next);
		} catch {
			// storage unavailable (private mode etc.); the choice just won't persist
		}

		const typed = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;
		if (!typed || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			apply();
			return;
		}

		// A short crossfade between the two themes (see `theme` in app.css).
		document.startViewTransition({ update: () => flushSync(apply), types: ['theme'] });
	}
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={toggle}
	aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
>
	<!-- One icon that morphs: in dark mode it's a sun (switch to light), in light mode a moon.
	     The disc grows into the moon while a mask circle slides in to cut the crescent,
	     and the rays spin and shrink away. -->
	<svg viewBox="0 0 16 16" aria-hidden="true" class:sun={theme === 'dark'} class:animate>
		<mask id="{id}-crescent">
			<rect width="16" height="16" fill="white" />
			<circle class="cut" cx="12" cy="4" r="5" fill="black" />
		</mask>
		<circle class="disc" cx="8" cy="8" r="6" mask="url(#{id}-crescent)" />
		<path
			class="rays"
			d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
		/>
	</svg>
</button>

<style>
	button {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		margin: -8px -8px -8px 0;
		border-radius: 50%;
		color: var(--muted);
		transition:
			color 0.15s,
			background-color 0.15s;
	}

	button:hover {
		color: var(--text);
		background: var(--surface);
	}

	svg {
		width: 16px;
		overflow: visible;
	}

	.disc {
		fill: currentColor;
		transform-box: fill-box;
		transform-origin: center;
	}

	.rays {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
		stroke-linecap: round;
		transform-box: fill-box;
		transform-origin: center;
	}

	/* moon */
	svg:not(.sun) .rays {
		opacity: 0;
		transform: rotate(-90deg) scale(0.5);
	}

	/* sun */
	.sun .disc {
		transform: scale(0.5);
	}

	.sun .cut {
		transform: translate(6px, -6px);
	}

	/* Slight delay so most of the morph plays once the page crossfade has settled. */
	.animate .disc,
	.animate .cut,
	.animate .rays {
		transition:
			transform 0.5s var(--ease) 0.12s,
			opacity 0.35s var(--ease) 0.12s;
	}
</style>
