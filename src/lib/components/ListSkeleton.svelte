<script lang="ts">
	import type { SearchKind } from '#lib/state/search.svelte.js';

	let { kind, count = 8 }: { kind: SearchKind; count?: number } = $props();
</script>

<div class="skeleton {kind}" aria-hidden="true">
	{#each { length: count }, i (i)}
		{#if kind === 'artists'}
			<div class="row">
				<span class="block circle"></span>
				<span class="block line" style:width="{40 + ((i * 37) % 35)}%"></span>
			</div>
		{:else}
			<div class="card">
				<span class="block square"></span>
				<span class="block line" style:width="70%"></span>
				<span class="block line short"></span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.block {
		display: block;
		background: var(--surface);
		animation: pulse 1.4s ease-in-out infinite;
	}

	.artists .row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-block: 10px;
	}

	.circle {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		flex: none;
	}

	.line {
		height: 12px;
	}

	.short {
		width: 45%;
		margin-top: 8px;
	}

	.albums {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 36px 24px;
	}

	.square {
		aspect-ratio: 1;
		margin-bottom: 14px;
	}

	@keyframes pulse {
		50% {
			opacity: 0.5;
		}
	}
</style>
