<script lang="ts">
	import { fly } from 'svelte/transition';
	import { player } from '#lib/state/player.svelte.js';
</script>

{#if player.current}
	{@const track = player.current}
	<div class="now" role="region" aria-label="Now playing" transition:fly={{ y: 24, duration: 250 }}>
		<button
			type="button"
			class="toggle"
			aria-label={player.playing ? 'Pause preview' : 'Play preview'}
			onclick={() => player.toggle(track)}
		>
			<svg viewBox="0 0 16 16" aria-hidden="true">
				{#if player.playing}
					<path d="M5 3.5v9M11 3.5v9" />
				{:else}
					<path d="M4.2 3.2v9.6L11.8 8z" />
				{/if}
			</svg>
		</button>
		<p>
			<span class="title">{track.title}</span>
			<span class="artist">{track.artist} · Preview</span>
		</p>
		<button type="button" class="close" aria-label="Stop preview" onclick={() => player.stop()}>
			<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
		</button>
		<span class="progress" style:transform="scaleX({player.progress})" aria-hidden="true"></span>
	</div>
{/if}

<style>
	.now {
		position: fixed;
		z-index: 20;
		bottom: max(16px, env(safe-area-inset-bottom));
		left: 50%;
		translate: -50% 0;
		width: min(420px, calc(100% - 32px));
		display: grid;
		grid-template-columns: 36px minmax(0, 1fr) 32px;
		align-items: center;
		gap: 12px;
		padding: 10px 10px 10px 12px;
		overflow: hidden;
		background: var(--text);
		color: var(--bg);
		box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.35);
	}

	button {
		display: grid;
		place-items: center;
		border-radius: 50%;
	}

	.toggle {
		width: 36px;
		height: 36px;
		background: var(--bg);
		color: var(--text);
	}

	.close {
		width: 32px;
		height: 32px;
		opacity: 0.6;
		transition: opacity 0.15s;
	}

	.close:hover {
		opacity: 1;
	}

	svg {
		width: 14px;
		fill: currentColor;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.close svg {
		fill: none;
		stroke-width: 1.25;
	}

	p {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.35;
	}

	.title,
	.artist {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		font-size: 0.9375rem;
		font-weight: 400;
	}

	.artist {
		font-size: 0.8125rem;
		opacity: 0.6;
	}

	.progress {
		position: absolute;
		inset: auto 0 0;
		height: 2px;
		background: var(--bg);
		opacity: 0.5;
		transform-origin: left;
		transition: transform 0.25s linear;
	}

	:focus-visible {
		outline-color: var(--bg);
	}
</style>
