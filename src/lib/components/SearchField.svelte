<script lang="ts">
	interface Props {
		value: string;
		placeholder: string;
		loading?: boolean;
		oninput: () => void;
		onsubmit: () => void;
		onclear: () => void;
	}

	let {
		value = $bindable(),
		placeholder,
		loading = false,
		oninput,
		onsubmit,
		onclear
	}: Props = $props();

	let input: HTMLInputElement;

	export function focus() {
		input.focus();
	}

	function clear() {
		onclear();
		input.focus();
	}
</script>

<form
	role="search"
	onsubmit={(e) => {
		e.preventDefault();
		onsubmit();
	}}
>
	<label for="search" class="visually-hidden">{placeholder}</label>
	<input
		id="search"
		bind:this={input}
		bind:value
		{oninput}
		onkeydown={(e) => {
			if (e.key === 'Escape' && value) {
				e.preventDefault();
				clear();
			}
		}}
		type="search"
		{placeholder}
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		enterkeyhint="search"
	/>
	{#if value}
		<button type="button" class="clear" aria-label="Clear search" onclick={clear}>
			<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
		</button>
	{/if}
	<span class="rule" class:loading aria-hidden="true"></span>
</form>

<style>
	form {
		position: relative;
		display: flex;
		align-items: center;
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0 44px 8px 0;
		border: 0;
		background: none;
		font-size: clamp(2.25rem, 7vw, 4rem);
		font-weight: 250;
		letter-spacing: -0.035em;
		/* Inputs clip glyphs to their box; leave room for descenders (g, j, p, y). */
		line-height: 1.3;
		outline: none;
		appearance: none;
	}

	input::placeholder {
		color: var(--faint);
	}

	input::-webkit-search-cancel-button {
		appearance: none;
	}

	.clear {
		position: absolute;
		right: 0;
		top: 50%;
		translate: 0 calc(-50% - 4px);
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		color: var(--muted);
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.clear:hover {
		background: var(--surface);
		color: var(--text);
	}

	.clear svg {
		width: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
	}

	.rule {
		position: absolute;
		inset: auto 0 0;
		height: 1px;
		background: var(--line);
		overflow: hidden;
		transition: background-color 0.2s;
	}

	form:focus-within .rule {
		background: var(--muted);
	}

	.rule.loading::after {
		content: '';
		position: absolute;
		inset: 0;
		width: 30%;
		background: var(--text);
		animation: sweep 1s var(--ease) infinite;
	}

	@keyframes sweep {
		from {
			translate: -100% 0;
		}
		to {
			translate: 340% 0;
		}
	}
</style>
