<script lang="ts">
	import { useLanyard } from 'svelte-lanyard'
	import { cubicInOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'

	const data = useLanyard('394953409855488012')

	let currentTimestamp: number = Date.now()
	let startTimestamp: number = 0
	let endTimestamp: number = 0
	let currentMinutes: number = 0
	let currentSeconds: number = 0
	let intervalRate: number = 1000
	let clear: ReturnType<typeof setInterval>
	let progress = 0

	// For Progress Bar

	function updateTimestamps(spotify_data: typeof $data) {
		if (spotify_data) {
			currentTimestamp = Date.now()
			startTimestamp = spotify_data.spotify?.timestamps.start!
			endTimestamp = spotify_data.spotify?.timestamps.end!
			let totalDuration = endTimestamp - startTimestamp
			let elapsedDuration = currentTimestamp - startTimestamp
			progress = (elapsedDuration / totalDuration) * 100

			let differenceInMilliseconds = currentTimestamp - startTimestamp!
			currentMinutes = Math.floor(differenceInMilliseconds / (1000 * 60)) // Convert milliseconds to minutes

			currentSeconds = Math.floor((differenceInMilliseconds / 1000) % 60)
		}
	}

	$: {
		clearInterval(clear)
		clear = setInterval(() => updateTimestamps($data), intervalRate)
	}

	$: formattedSeconds = currentSeconds < 10 ? '0' + currentSeconds : currentSeconds
</script>

{#if $data}
	<section class="md:block hidden p-2 space-y-2">
		{#if $data.listening_to_spotify}
			<span class="block font-semibold">Listening to Spotify</span>
			<div class="grid gap-2">
				<img
					src={$data.spotify?.album_art_url}
					alt="activity"
					class="w-14 h-14 aspect-video object-cover"
				/>
				<section class="">
					<span class="block text-ellipsis overflow-hidden whitespace-nowrap"
						>{$data.spotify?.song}</span
					>
					<span class="block text-ellipsis overflow-hidden whitespace-nowrap"
						>on {$data.spotify?.album}</span
					>
				</section>
			</div>
			<div class="progress-bar h-2 bg-primary-tint rounded-md overflow-hidden">
				<div class="bg-accent h-full progress-bar-inner" style={`--progress: ${progress}%`}></div>
			</div>
			<time>
				{currentMinutes}:{formattedSeconds}
			</time>
		{/if}
	</section>
{/if}

<style>
	div:not(.progress-bar) {
		grid-template-columns: 30% 70%;
	}

	.progress-bar-inner {
		width: var(--progress);
	}
</style>
