<script lang="ts">
	import { onMount } from 'svelte'
	import { useLanyard } from 'svelte-lanyard'
	import { fly } from 'svelte/transition'
	import Game from '$components/icons-svelte/game.svelte'
	import Spotify from '$components/icons-svelte/spotify.svelte'

	const UPDATE_TIMESTAMPS_RATE: number = 1000
	const PING_PONG_WEBSOCKET_RATE: number = 300000

	let data: ReturnType<typeof useLanyard>

	let currentTimestamp: number = Date.now()
	let startTimestamp: number = 0
	let endTimestamp: number = 0
	let currentMinutes: number = 0
	let currentSeconds: number = 0
	let clear: ReturnType<typeof setInterval>
	let pingPongWebsocket: ReturnType<typeof setInterval>
	let progress = 0

	onMount(() => {
		data = useLanyard('394953409855488012')
		pingPongWebsocket = setInterval(() => {
			data = useLanyard('394953409855488012')
		}, PING_PONG_WEBSOCKET_RATE)
		clear = setInterval(() => updateTimestamps($data), UPDATE_TIMESTAMPS_RATE)

		return () => {
			clearInterval(clear)
			clearInterval(pingPongWebsocket)
		}
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

	function getCurrentTitle(data: typeof $data) {
		if (data && data.listening_to_spotify) {
			return 'Listening to Spotify'
		}

		if (data && data.activities.length >= 1) {
			return 'Playing'
		}

		return 'Thinking...'
	}

	$: formattedSeconds = currentSeconds < 10 ? '0' + currentSeconds : currentSeconds
</script>

<section class="p-1 overflow-hidden">
	<header class="flex items-center gap-2 md:border-b border-b-highlight md:pb-1 md:mb-1 text-sm">
		<span
			class:text-green-500={$data && $data.discord_status === 'online'}
			class:text-yellow-500={$data && $data.discord_status === 'idle'}
			class:text-red-500={($data && $data.discord_status === 'dnd') ||
				($data && $data.discord_status === 'offline')}
		>
			{#if $data && $data.listening_to_spotify}
				<Spotify />
			{/if}

			{#if $data && !$data.listening_to_spotify && $data.activities.length >= 1}
				<Game />
			{/if}
		</span>

		<div
			class="h-2 w-2 rounded-full animate-bounce transition-colors duration-150 ease-linear"
			class:bg-green-500={$data && $data.discord_status === 'online'}
			class:bg-yellow-500={$data && $data.discord_status === 'idle'}
			class:bg-red-500={($data && $data.discord_status === 'dnd') ||
				($data && $data.discord_status === 'offline') ||
				!$data}
			class:hidden={$data && $data.activities.length > 0}
		></div>

		<span class="font-mono">{getCurrentTitle($data)}</span>
	</header>

	{#if $data}
		{#if $data.listening_to_spotify}
			<section
				class="md:p-2 pb-2 md:px-1 text-sm flex md:block items-center gap-2"
				in:fly={{ x: -50, duration: 100 }}
				out:fly={{ x: 50, duration: 100 }}
			>
				<a
					href={`spotify:track:${$data.spotify?.track_id}`}
					class="flex items-center md:block gap-2"
				>
					<span class="block text-ellipsis overflow-hidden whitespace-nowrap font-bold"
						>{$data.spotify?.song}</span
					>
					<span class="block text-ellipsis overflow-hidden whitespace-nowrap"
						>by <span class="font-bold">{$data.spotify?.artist}</span></span
					>
				</a>
				<div
					class="progress-bar h-2 bg-spotify-progress-outer rounded-md overflow-hidden mt-2 hidden md:block"
				>
					<div
						class="bg-spotify-progress h-full w-[--progress] transition-[width] duration-75 ease-linear"
						style={`--progress: ${progress}%`}
					></div>
				</div>
				<time class="hidden md:block">
					{currentMinutes}:{formattedSeconds}
				</time>
			</section>
		{/if}
		{#if !$data.listening_to_spotify && $data.activities.length >= 1}
			<section>
				<span class="font-semibold text-heading">{$data.activities[0].name}</span>
				{#if $data.activities[0].state}
					<div>
						<span>Currently: </span><span class="font-semibold">{$data.activities[0].state}</span>
					</div>
				{/if}
			</section>
		{/if}
	{/if}
</section>
