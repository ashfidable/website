// Script to load audio for clicking sfx on links. AudioContext Support.
document.addEventListener('astro:page-load', (ev) => {
	const LINKS = document.querySelectorAll('nav a[href]')
	const AUDIO_CLICK_URL = '/audio/click.mp3'

	if (window.AudioContext || 'webkitAudioContext' in window) {
		const audioContext = new AudioContext()
		let audioBuffer: AudioBuffer

		fetch(AUDIO_CLICK_URL)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
			.then((decodedAudioBuffer) => {
				audioBuffer = decodedAudioBuffer
			})
			.catch((error) => console.error('Error loading audio file:', error))

		function playAudioOnClick(event: Event) {
			const getSoundsPreferenceFromStorage = localStorage.getItem('settings')
			const sounds = JSON.parse(getSoundsPreferenceFromStorage!).sound
			if (!audioBuffer) {
				console.log('Audio Buffer not loaded yet.')
				return
			}
			if (audioBuffer && sounds) {
				const source = audioContext.createBufferSource()
				source.buffer = audioBuffer

				const gainNode = audioContext.createGain()
				gainNode.gain.value = 0.1

				source.connect(gainNode)
				gainNode.connect(audioContext.destination)

				source.start(0)
			}
		}

		LINKS.forEach((link) => {
			link.addEventListener('click', playAudioOnClick)
		})
	} else {
		const click = new Audio(AUDIO_CLICK_URL)
		click.load()

		function playClick() {
			const getSoundsPreferenceFromStorage = localStorage.getItem('settings')
			const sounds = JSON.parse(getSoundsPreferenceFromStorage!).sound

			if (sounds) {
				click.pause()
				click.volume = 0.5
				click.currentTime = 0
				click.play()
			}
		}

		LINKS.forEach((link) => {
			link.addEventListener('click', playClick)
		})
	}
})
