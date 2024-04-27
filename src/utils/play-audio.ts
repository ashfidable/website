// Script to load audio for clicking sfx on links.
document.addEventListener('astro:page-load', (ev) => {
	const click = new Audio('/audio/clicky.mp3')
	const allLinkElements = document.querySelectorAll('nav a[href]')

	click.load()

	click.addEventListener('canplaythrough', () => {
		allLinkElements.forEach((link) => {
			link.addEventListener('click', playClick)
		})
	})

	function playClick() {
		const getSoundsPreferenceFromStorage = localStorage.getItem('settings')
		const sounds = JSON.parse(getSoundsPreferenceFromStorage!).sound

		click.volume = 0.5
		click.currentTime = 0

		if (sounds) {
			click.play()
		}
	}
})
