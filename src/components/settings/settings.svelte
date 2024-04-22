<script lang="ts">
	import { onMount } from 'svelte'
	import { settingsStore } from '$stores/settings-store'
	import Button from '$components/button.svelte'

	const themes = ['dark', 'light']
	const codeThemes = ['github-dark', 'aurora-x', 'rose-pine']

	let codeThemeSelected: string = codeThemes[0]
	let themeSelected: string = $settingsStore.theme

	let html: HTMLElement

	export let isMobile = false

	let open: boolean = isMobile ? true : false

	onMount(() => {
		html = document.documentElement
	})

	function handleTheme(newTheme: string) {
		themeSelected = newTheme
		$settingsStore = { ...$settingsStore, theme: newTheme }
	}

	function handleCodeThemeChange(e: MouseEvent) {
		console.log(codeThemeSelected)
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
		open = !open
	}

	function closeViaKeyboard(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false
		}
	}
</script>

<svelte:body on:keydown={closeViaKeyboard} />

<div class="md:relative">
	<!-- Button for opening the options -->
	<Button onclick={() => toggleButton()} classes="hidden md:block">
		<div class:animate-bounce={open} class="text-2xl">
			<span class="sr-only">Settings Menu</span>
			<slot name="icon" />
		</div>
	</Button>
	<!-- Options -->
	{#if open}
		<div
			class="md:bg-card md:border md:border-b-4 md:border-highlight md:absolute md:right-0 mt-0 md:mt-6 md:w-72 rounded-md md:p-4 space-y-4 z-[70]"
		>
			<!-- Theme -->
			<section class="space-y-2 font-mono">
				<h4 class=" text-base font-bold">Theme</h4>
				<ul class="md:grid md:grid-cols-6 flex gap-2 md:gap-4">
					{#each themes as theme}
						<li>
							<button
								data-theme={theme}
								on:click={(e) => handleTheme(theme)}
								class="w-8 h-8 md:w-6 md:h-6 bg-gradient-to-r from-[var(--color-theme-primary)] to-[--color-theme-secondary] from-65% to-50% outline outline-2 outline-highlight rounded-md"
								class:outline-highlight-hover={theme === themeSelected}
								class:outline-offset-2={theme === themeSelected}
							>
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Code Theme -->
			<!-- <section class="space-y-2 font-mono">
				<h4 class=" text-lg font-bold">Code Theme</h4>
				<select bind:value={codeThemeSelected} on:change={handleCodeThemeChange}>
					{#each codeThemes as theme}
						<option value={theme}>{theme}</option>
					{/each}
				</select>
			</section> -->

			<!-- UI Settings -->
			<section class="font-mono space-y-2">
				<h4 class="text-base font-bold">UI Settings</h4>
				<ul>
					<li>
						<label class="flex items-center justify-between text-base accent-base">
							Rounded
							<input
								type="checkbox"
								bind:checked={$settingsStore.rounded}
								on:input={changeRounded}
							/>
						</label>
					</li>
				</ul>
			</section>
		</div>
	{/if}

	{#if open && !isMobile}
		<button
			id="settings-overlay"
			aria-label="overlay-for-settings"
			tabindex="-1"
			class="fixed bg-[black] top-0 left-0 w-full h-full z-[60] bg-opacity-40 backdrop-blur-sm"
			on:click={toggleButton}
		></button>
	{/if}
</div>
