<script>
	import { fly } from 'svelte/transition'

	export let showThreshold = 150

	let show = false

	function container() {
		return document.documentElement || document.body
	}

	function handleScroll() {
		if (!container()) {
			return
		}

		show = container().scrollTop > showThreshold ? true : false
	}

	function backToTop() {
		document.body.scrollIntoView()
	}
</script>

<svelte:window on:scroll={handleScroll} />

<div
	class="fixed z-50 hidden md:block pointer-events-none p-4 mb-4 bottom-0 right-0 left-0 max-w-6xl mx-auto"
>
	{#if show}
		<button
			class="text-6xl bg-button-active outline outline-highlight-hover absolute right-0 bottom-0 rounded-md hover:bg-button-hover mr-4 pointer-events-auto"
			on:click={backToTop}
			transition:fly={{ y: 100, duration: 150 }}
		>
			<span class="sr-only">Scroll To Top</span>
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
				<path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
			</svg>
		</button>
	{/if}
</div>
