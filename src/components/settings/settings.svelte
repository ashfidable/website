<script lang="ts">
	import { onMount } from 'svelte'
	import { settingsStore } from '$stores/settings-store'
	import Button from '$components/button.svelte'

	const themes = ['dark', 'light']

	let html: HTMLElement

	let open: boolean = false

	// TODO: Adding isDesktop or isMobile variable to make this reusable component?

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
		open = !open
	}

	function closeViaKeyboard(e: KeyboardEvent) {
		if (e.key === 'Escape' && !open) {
			open = true
		}
	}
</script>

<svelte:body on:keydown={closeViaKeyboard} />

<div class="md:relative">
	<!-- Button for opening the options -->
	<Button onclick={() => toggleButton()} classes="hidden md:block">
		<div class:animate-bounce={!open} class="text-2xl">
			<span class="sr-only">Settings Menu</span>
			<slot name="icon" />
		</div>
	</Button>
	<!-- Options -->
	{#if open}
		<div
			class="md:bg-card md:border md:border-b-4 md:border-highlight md:absolute md:right-0 mt-0 md:mt-6 md:w-72 rounded-md md:p-4 md:space-y-8 space-y-4 z-[70]"
		>
			<!-- Theme -->
			<section class="space-y-2 font-mono">
				<h4 class=" text-lg font-bold">Theme</h4>
				<ul class="md:grid md:grid-cols-6 flex gap-2 md:gap-4">
					{#each themes as theme}
						<li>
							<button
								data-theme-string={theme}
								data-theme={theme}
								on:click={(e) => handleThemeChange(e)}
								class="w-12 h-12 md:w-6 md:h-6 bg-gradient-to-r from-[var(--color-theme-primary)] to-[--color-theme-secondary] from-65% to-50% border-2 border-highlight rounded-md"
							>
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<!-- UI Settings -->
			<section class="font-mono space-y-2">
				<h4 class="text-lg font-bold">UI Settings</h4>
				<ul>
					<li>
						<label class="flex items-center justify-between text-base">
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

	{#if open}
		<button
			id="settings-overlay"
			aria-label="overlay-for-settings"
			tabindex="-1"
			class="fixed bg-[black] top-0 left-0 w-full h-full z-[60] bg-opacity-40 backdrop-blur-sm"
			on:click={toggleButton}
		></button>
	{/if}
</div>
