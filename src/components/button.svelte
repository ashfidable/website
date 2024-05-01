<script lang="ts">
	export let onclick: () => void | ((e: Event) => void) | Promise<void> | void
	export let classes = ''
</script>

<button
	class={`rounded-md bg-button p-1 px-2 font-semibold text-button-text-active flex gap-2 items-center font-heading tracking-wide active:scale-105 transition-all duration-100 ease-springy hover:outline outline-highlight-hover outline-2 active:outline hover:bg-button-hover  ${classes}`}
	on:click={onclick}
	{...$$restProps}
>
	<slot />
</button>
