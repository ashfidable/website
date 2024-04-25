import { get, writable } from 'svelte/store'
import { themes } from '$components/settings/themes'

interface Settings {
	theme: string
	codeTheme?: string
	rounded?: boolean
}

function createSettingsStore() {
	const darktheme = themes.find((t) => t.name === 'dark')!

	let initialValues = {
		theme: darktheme.name,
		codeTheme: darktheme.codeTheme,
		rounded: true
	}
	const store = writable<Settings>(initialValues)

	const localStorageAvailable = typeof localStorage !== 'undefined'

	const getValueFromLocalStorage = localStorageAvailable ? localStorage.getItem('settings') : null

	if (getValueFromLocalStorage !== null && localStorageAvailable) {
		const value: Settings = JSON.parse(getValueFromLocalStorage)
		store.set(value)
	}

	function toggleRounded() {
		store.update((values) => {
			return {
				...values,
				rounded: (values.rounded = !values.rounded)
			}
		})

		localStorage.setItem('settings', JSON.stringify(get(store)))
	}

	function changeTheme(themeName: string) {
		const foundTheme = themes.find((t) => t.name === themeName)

		if (!foundTheme) {
			console.log('No Theme Found')
			return
		}

		store.update((values) => {
			return {
				...values,
				theme: foundTheme.name,
				codeTheme: foundTheme.codeTheme
			}
		})

		localStorage.setItem('settings', JSON.stringify(get(store)))
	}

	// store.subscribe((value) => {
	// 	if (localStorageAvailable) {
	// 		localStorage.setItem('settings', JSON.stringify(value))
	// 	}
	// })

	return {
		...store,
		toggleRounded,
		changeTheme
	}
}

export const settingsStore = createSettingsStore()
