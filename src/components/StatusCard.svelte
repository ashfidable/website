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
		<section class="md:p-2 pb-2 md:px-1 text-sm flex md:block items-center gap-2" transition:fade>
			<span
				class="flex gap-2 items-center font-mono font-semibold md:pb-1 md:border-b border-b-highlight md:mb-4"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
					<path
						fill="#1ed760"
						d="M128 0C57.308 0 0 57.309 0 128c0 70.696 57.309 128 128 128c70.697 0 128-57.304 128-128C256 57.314 198.697.007 127.998.007zm58.699 184.614c-2.293 3.76-7.215 4.952-10.975 2.644c-30.053-18.357-67.885-22.515-112.44-12.335a7.981 7.981 0 0 1-9.552-6.007a7.968 7.968 0 0 1 6-9.553c48.76-11.14 90.583-6.344 124.323 14.276c3.76 2.308 4.952 7.215 2.644 10.975m15.667-34.853c-2.89 4.695-9.034 6.178-13.726 3.289c-34.406-21.148-86.853-27.273-127.548-14.92c-5.278 1.594-10.852-1.38-12.454-6.649c-1.59-5.278 1.386-10.842 6.655-12.446c46.485-14.106 104.275-7.273 143.787 17.007c4.692 2.89 6.175 9.034 3.286 13.72zm1.345-36.293C162.457 88.964 94.394 86.71 55.007 98.666c-6.325 1.918-13.014-1.653-14.93-7.978c-1.917-6.328 1.65-13.012 7.98-14.935C93.27 62.027 168.434 64.68 215.929 92.876c5.702 3.376 7.566 10.724 4.188 16.405c-3.362 5.69-10.73 7.565-16.4 4.187z"
					/>
				</svg>
				<span class="hidden md:block">Listening to Spotify</span>
			</span>
			<a href={`spotify:track:${$data.spotify?.track_id}`}>
				<section class="flex items-center md:block gap-2">
					<span class="block text-ellipsis overflow-hidden whitespace-nowrap font-bold"
						>{$data.spotify?.song}</span
					><span class="block text-ellipsis overflow-hidden whitespace-nowrap"
						>by <span class="font-bold">{$data.spotify?.artist}</span></span
					>
				</section>
			</a>
			<div
				class="progress-bar h-2 bg-spotify-progress-outer rounded-md overflow-hidden mt-2 hidden md:block"
			>
				<div
					class="bg-spotify-progress h-full progress-bar-inner"
					style={`--progress: ${progress}%`}
				></div>
			</div>
			<time class="hidden md:block">
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
