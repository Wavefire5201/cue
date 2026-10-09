<script lang="ts">
	let { items }: { items: { label: string; value: string }[] } = $props();
</script>

<dl>
	{#each items as item (item.label)}
		<div>
			<dt class="label">{item.label}</dt>
			<dd class="num">{item.value}</dd>
		</div>
	{/each}
</dl>

<style>
	dl {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 40px;
		margin: 0;
	}

	dt {
		font-size: 0.6875rem;
	}

	dd {
		margin: 2px 0 0;
		font-size: 1.25rem;
		letter-spacing: -0.015em;
	}
</style>
