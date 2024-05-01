<script lang="ts">
	import { fly } from 'svelte/transition'
	import { settingsStore } from '$stores/settings-store'
	import { themes } from '$components/settings/themes'
	import { onMount } from 'svelte'

	const SOUND_TOGGLE_ON_URL = '/audio/sound_toggle_on.mp3'
	const FLY_IN_OUT_URL = '/audio/fly_in_out.mp3'
	const DELAY_DURATION = 75
	const THEMES = themes

	let isExpanded = false
	let soundOnBuffer: AudioBuffer
	let flyInOutBuffer: AudioBuffer
	let audioContext: AudioContext

	function handleTheme(newTheme: (typeof themes)[0]) {
		themeSelected = newTheme.name
		settingsStore.changeTheme(newTheme.name)
	}

	$: themeSelected = $settingsStore.theme

	function playAudioOnClick(buffer: AudioBuffer, useUserPreference: boolean = true) {
		const getSoundsPreferenceFromStorage = localStorage.getItem('settings')
		const sounds = useUserPreference ? JSON.parse(getSoundsPreferenceFromStorage!).sound : true

		if (!buffer) {
			console.log('Audio Buffer not loaded yet.')
			return
		}
		if (buffer && sounds) {
			const source = audioContext.createBufferSource()
			source.buffer = buffer

			const gainNode = audioContext.createGain()
			gainNode.gain.value = 0.2

			source.connect(gainNode)
			gainNode.connect(audioContext.destination)

			source.start(0)
			console.log('Play')
		}
	}

	onMount(() => {
		audioContext = new AudioContext()
		fetch(SOUND_TOGGLE_ON_URL)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
			.then((decodedAudioBuffer) => {
				soundOnBuffer = decodedAudioBuffer
			})
			.catch((error) => console.error('Error loading audio file:', error))

		fetch(FLY_IN_OUT_URL)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
			.then((decodedAudioBuffer) => {
				flyInOutBuffer = decodedAudioBuffer
			})
			.catch((error) => console.error('Error loading audio file:', error))
	})
</script>

<div class="flex items-center gap-4 text-2xl md:text-xl py-4 md:py-0 rounded-md">
	<div class="flex gap-2 items-center">
		<button
			class:text-button-text-active={$settingsStore.sound}
			on:click={() => {
				settingsStore.toggleSounds()
				playAudioOnClick(soundOnBuffer, false)
			}}
			class="bg-button md:bg-card p-2 rounded-md hover:bg-button-hover active:bg-button-active ease-springy transition-colors duration-200"
		>
			<span class="sr-only">Sounds</span>
			{#if $settingsStore.sound}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9z"
					/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.9 8.9 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63"
					/>
				</svg>
			{/if}
		</button>
		<button
			on:click={(e) => {
				settingsStore.toggleRounded()
				playAudioOnClick(soundOnBuffer, true)
			}}
			class:text-button-text-active={$settingsStore.rounded}
			class="bg-button md:bg-card p-2 rounded-md hover:bg-button-hover active:bg-button-active ease-springy transition-colors duration-200"
		>
			<span class="sr-only">Rounds</span>
			{#if $settingsStore.rounded}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M8 3h8c2.76 0 5 2.24 5 5v8c0 2.76-2.24 5-5 5H8c-2.76 0-5-2.24-5-5V8c0-2.76 2.24-5 5-5m0 2C6.34 5 5 6.34 5 8v8c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V8c0-1.66-1.34-3-3-3z"
					/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M3 3h18v18H3zm2 2v14h14V5z" />
				</svg>
			{/if}
		</button>
		<button
			on:click={(e) => {
				isExpanded = !isExpanded
				playAudioOnClick(flyInOutBuffer)
			}}
			class:text-button-text-active={isExpanded}
			class="bg-button md:bg-card p-2 rounded-md hover:bg-button-hover active:bg-button-active ease-springy transition-colors duration-200"
		>
			<span class="sr-only">Themes</span>
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="m19.228 18.732l1.767-1.767l1.768 1.767a2.5 2.5 0 1 1-3.535 0M8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778l-2.122-2.121zM11 6.03L3.929 13.1H18.07z"
				/>
			</svg></button
		>
	</div>

	<div
		style="--dynamic-width: {THEMES.length * 32}px"
		class="flex gap-2 {isExpanded
			? 'md:w-[--dynamic-width]'
			: 'md:w-0'} w-full transition-all ease-in-out duration-75"
	>
		{#each THEMES as theme, index}
			{#if isExpanded}
				<button
					data-theme={theme.name}
					class="h-6 w-6 bg-gradient-to-r from-[var(--color-theme-primary)] to-[--color-theme-secondary] from-65% to-50% outline outline-2 outline-highlight rounded-md"
					transition:fly={{ delay: DELAY_DURATION * (index + 1), y: -100 }}
					on:click={(e) => handleTheme(theme)}
					class:outline-highlight-hover={theme.name === $settingsStore.theme}
					class:outline-offset-2={theme.name === $settingsStore.theme}
				></button>
			{/if}
		{/each}
	</div>
</div>
