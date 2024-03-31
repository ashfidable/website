<script lang="ts">
	export let onclick: () => void | ((e: Event) => void) | Promise<void> | void
</script>

<button
	class="rounded-md bg-input p-1 px-2 font-bold text-body flex gap-2 items-center font-heading tracking-wide active:scale-105 transition-transform duration-100 ease-[var(--ease-custom)]"
	on:click={onclick}
	{...$$restProps}
>
	<slot />
</button>
