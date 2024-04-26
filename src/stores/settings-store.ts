import { get, writable } from 'svelte/store'

interface Settings {
	theme: string
	rounded?: boolean
	sound?: boolean
}

let initialValues: Settings = {
	theme: 'dark',
	rounded: true,
	sound: true
}

function createSettingsStore() {
	const store = writable<Settings>(initialValues)

	const localStorageAvailable = typeof localStorage !== 'undefined'

	const getValueFromLocalStorage = localStorageAvailable ? localStorage.getItem('settings') : null

	if (getValueFromLocalStorage !== null) {
		const value: Settings = JSON.parse(getValueFromLocalStorage)
		store.set({ ...initialValues, ...value })
		saveToLocalStorage()
		applyToLayout()
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
		store.update((values) => {
			return {
				...values,
				theme: themeName
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
			const value = get(store)[key as keyof Settings]

			if (document.documentElement && key !== 'sound' && key !== 'version') {
				document.documentElement.setAttribute(`data-${key}`, value as string)
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
