import { get, writable } from 'svelte/store'
import { themes } from '$components/settings/themes'

interface Settings {
	theme: string
	rounded?: boolean
	sound?: boolean
}

function createSettingsStore() {
	const darktheme = themes.find((t) => t.name === 'dark')!

	let initialValues: Settings = {
		theme: darktheme.name,
		rounded: true,
		sound: true
	}
	const store = writable<Settings>(initialValues)

	const localStorageAvailable = typeof localStorage !== 'undefined'

	const getValueFromLocalStorage = localStorageAvailable ? localStorage.getItem('settings') : null

	if (getValueFromLocalStorage !== null) {
		const value: Settings = JSON.parse(getValueFromLocalStorage)
		store.set({ ...initialValues, ...value })
	}

	if (localStorageAvailable) {
		saveToLocalStorage()
	}

	function toggleRounded() {
		store.update((values) => {
			return {
				...values,
				rounded: (values.rounded = !values.rounded)
			}
		})

		saveToLocalStorage()
		applyToLayout()
	}

	function toggleSounds() {
		store.update((values) => {
			return {
				...values,
				sound: (values.sound = !values.sound)
			}
		})

		saveToLocalStorage()
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
				theme: foundTheme.name
			}
		})

		saveToLocalStorage()
		applyToLayout()
	}

	function saveToLocalStorage() {
		localStorage.setItem('settings', JSON.stringify(get(store)))
	}

	function applyToLayout() {
		Object.keys(get(store)).map((key) => {
			const value = get(store)[key]

			if (document.documentElement) {
				document.documentElement.dataset[key] = value
			}
		})
	}

	return {
		...store,
		toggleRounded,
		changeTheme,
		toggleSounds
	}
}

export const settingsStore = createSettingsStore()
