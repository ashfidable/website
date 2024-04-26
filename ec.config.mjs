import { defineEcConfig, ExpressiveCodeTheme, loadShikiTheme } from 'astro-expressive-code'

const darkTheme = new ExpressiveCodeTheme(await loadShikiTheme('houston'))
darkTheme.name = 'dark'

const lightTheme = new ExpressiveCodeTheme(await loadShikiTheme('vitesse-light'))
lightTheme.name = 'light'

export default defineEcConfig({
	// You can set configuration options here
	themes: [darkTheme, lightTheme]
})
