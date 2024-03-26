<script lang="ts">
	import { onMount } from 'svelte'
	import { useLanyard } from 'svelte-lanyard'
	import { fade } from 'svelte/transition'

	let data: ReturnType<typeof useLanyard>

	let currentTimestamp: number = Date.now()
	let startTimestamp: number = 0
	let endTimestamp: number = 0
	let currentMinutes: number = 0
	let currentSeconds: number = 0
	let intervalRate: number = 1000
	let clear: ReturnType<typeof setInterval>
	let progress = 0

	onMount(async () => {
		data = useLanyard('394953409855488012')
	})

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
	{#if $data.listening_to_spotify}
		<section class="md:block hidden p-2 px-1 text-sm" transition:fade>
			<span class="block font-mono font-semibold pb-1 border-b border-b-highlight mb-4"
				>Listening to Spotify</span
			>
			<a href={`spotify:track:${$data.spotify?.track_id}`}>
				<div class="">
					<section>
						<span class="block text-ellipsis overflow-hidden whitespace-nowrap font-bold"
							>{$data.spotify?.song}</span
						>
						<span class="block text-ellipsis overflow-hidden whitespace-nowrap"
							>by <span class="font-bold">{$data.spotify?.artist}</span></span
						>
					</section>
				</div>
			</a>
			<div class="progress-bar h-2 bg-spotify-progress-outer rounded-md overflow-hidden mt-2">
				<div
					class="bg-spotify-progress h-full progress-bar-inner"
					style={`--progress: ${progress}%`}
				></div>
			</div>
			<time>
				{currentMinutes}:{formattedSeconds}
			</time>
		</section>
	{/if}
{/if}

<style>
	.progress-bar-inner {
		width: var(--progress);
	}
</style>
