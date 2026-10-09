<script lang="ts">
	import type { SearchKind } from '#lib/state/search.svelte.js';

	interface Props {
		value: SearchKind;
		onchange: (kind: SearchKind) => void;
	}

	let { value, onchange }: Props = $props();

	const options: { kind: SearchKind; label: string }[] = [
		{ kind: 'artists', label: 'Artists' },
		{ kind: 'albums', label: 'Albums' }
	];
</script>

<div class="toggle" role="group" aria-label="Search for">
	{#each options as option (option.kind)}
		<button
			type="button"
			aria-pressed={value === option.kind}
			onclick={() => value !== option.kind && onchange(option.kind)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: flex;
		gap: 24px;
	}

	button {
		position: relative;
		padding-block: 4px;
		font-size: 0.9375rem;
		color: var(--muted);
		transition: color 0.15s;
	}

	button:hover,
	button[aria-pressed='true'] {
		color: var(--text);
	}

	button::after {
		content: '';
		position: absolute;
		inset: auto 0 -2px;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transition: transform 0.25s var(--ease);
	}

	button[aria-pressed='true']::after {
		transform: none;
	}
</style>
