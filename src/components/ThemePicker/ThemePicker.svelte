<script lang="ts">
	import { onMount } from 'svelte'
	import { settingsStore } from '$stores/settings-store'
	import Button from '$components/button.svelte'

	const themes = ['dark', 'light']

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

		$settingsStore = { ...$settingsStore, theme: themeString }
	}

	function changeRounded(e) {
		$settingsStore.rounded = !$settingsStore.rounded
	}

	$: Object.keys($settingsStore).forEach((setting) => {
		// @ts-ignore
		const value: string = $settingsStore[setting]

		if (html) {
			html.dataset[setting] = value
		}
	})

	function toggleButton() {
		hidden = !hidden
	}

	function closeViaKeyboard(e: KeyboardEvent) {
		if (e.key === 'Escape' && !hidden) {
			hidden = true
		}
	}
</script>

<svelte:body on:keydown={closeViaKeyboard} />
<div class="md:relative">
	<!-- Button for opening the options -->
	<Button onclick={() => toggleButton()}>
		<div class:animate-bounce={!hidden} class="text-2xl">
			<span class="sr-only">Settings Menu</span>
			<slot name="icon" />
		</div>
	</Button>
	<!-- Options -->
	<div
		class="bg-card md:border md:border-b-4 md:border-highlight md:absolute md:right-0 mt-6 md:w-72 rounded-md p-4 space-y-8 z-[70]"
		class:hidden
	>
		<!-- Theme -->
		<section class="space-y-4">
			<h4 class="font-heading tracking-wider text-lg font-bold">Theme</h4>
			<ul class="grid grid-cols-6 w-32 md:w-auto gap-4">
				{#each themes as theme}
					<li>
						<button
							data-theme-string={theme}
							data-theme={theme}
							on:click={(e) => handleThemeChange(e)}
							class="w-12 h-12 md:w-6 md:h-6 bg-gradient-to-r from-[var(--color-theme-primary)] to-[--color-theme-secondary] from-65% to-50% border-2 border-highlight"
						>
						</button>
					</li>
				{/each}
			</ul>
		</section>

		<!-- UI Settings -->
		<section class="font-mono space-y-4">
			<h4 class="font-heading tracking-wider text-lg font-bold">UI Settings</h4>
			<ul>
				<li>
					<label class="flex items-center justify-between text-base">
						Rounded
						<input type="checkbox" bind:checked={$settingsStore.rounded} on:input={changeRounded} />
					</label>
				</li>
			</ul>
		</section>
	</div>

	<button
		id="settings-overlay"
		aria-label="overlay-for-settings"
		tabindex="-1"
		class="fixed bg-[black] inset-0 z-[60] bg-opacity-40 backdrop-blur-sm"
		class:hidden
		on:click={toggleButton}
	></button>
</div>
