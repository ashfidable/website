<script lang="ts">
	import { onMount } from 'svelte'

	const themes = ['dark', 'light']

	let html: HTMLElement

	onMount(() => {
		html = document.documentElement
	})

	function handleThemeChange(e: MouseEvent) {
		const target = e.target as HTMLElement
		const themeString = target.dataset.themeString

		if (!html) return
		if (!themeString) return

		html.dataset.theme = themeString

		localStorage.setItem('theme', themeString)
	}
</script>

<div class="md:relative">
	<!-- Button for opening the options -->
	<button class="md:block hidden">
		<slot name="icon" />
	</button>
	<!-- Options -->
	<div class="bg-primary-shade md:absolute md:right-0 mt-6 w-32 rounded-lg p-4">
		<ul class="flex gap-4">
			{#each themes as theme}
				<li>
					<button data-theme-string={theme} on:click={(e) => handleThemeChange(e)}>{theme}</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
