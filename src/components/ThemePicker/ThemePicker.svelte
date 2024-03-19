<script lang="ts">
	import { onMount } from 'svelte'

	const themes = ['dark', 'light', 'bee', 'light', 'light', 'dark']

	let html: HTMLElement

	let hidden: boolean = true

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

	function toggleButton() {
		hidden = !hidden
	}
</script>

<div class="md:relative">
	<!-- Button for opening the options -->
	<button class="md:block hidden" on:click={toggleButton}>
		<slot name="icon" />
	</button>
	<!-- Options -->
	<div
		class="bg-body md:border-x-4 md:border-t-4 md:border-b-8 md:border-highlight md:absolute md:right-0 mt-6 md:w-72 rounded-lg p-4 space-y-4 z-[99999]"
		class:hidden
	>
		<!-- Theme -->
		<section class="space-y-2">
			<h4 class="font-heading font-bold">Theme</h4>
			<ul class="grid grid-cols-6 w-32 md:w-auto gap-4">
				{#each themes as theme}
					<li>
						<button
							data-theme-string={theme}
							data-theme={theme}
							on:click={(e) => handleThemeChange(e)}
							class="w-12 h-12 md:w-6 md:h-6 bg-gradient-to-r from-[var(--color-theme-primary)] to-[--color-theme-secondary] from-50% to-50% border-2 border-highlight"
						>
						</button>
					</li>
				{/each}
			</ul>
		</section>

		<!-- UI Settings -->
		<section>
			<h4 class="font-heading font-bold">UI Settings</h4>
		</section>
	</div>
</div>
