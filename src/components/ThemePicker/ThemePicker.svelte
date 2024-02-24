<script lang="ts">
	import { onMount } from 'svelte'

	const themes = ['dark', 'light', 'dark', 'light', 'light', 'dark']

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
	<div
		class="bg-primary-shade md:border-x-4 md:border-t-4 md:border-b-8 md:border-primary-tone md:shadow-md md:shadow-primary-tone md:absolute md:right-0 mt-6 md:w-32 rounded-lg p-4"
	>
		<ul class="grid grid-cols-2 w-32 md:flex gap-4">
			{#each themes as theme}
				<li>
					<button
						data-theme-string={theme}
						data-theme={theme}
						on:click={(e) => handleThemeChange(e)}
						class="w-12 h-12 bg-gradient-to-r from-primary-tone to-accent-tone from-50% to-50%"
					>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
