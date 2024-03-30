import { writable } from 'svelte/store'

interface Settings {
	theme: string
	codeTheme?: string
	rounded?: boolean
}

function createSettingsStore() {
	let initialValues = {
		theme: 'dark',
		codeTheme: 'default',
		rounded: true
	}
	const store = writable<Settings>(initialValues)

	const localStorageAvailable = typeof localStorage !== 'undefined'

	const getValueFromLocalStorage = localStorageAvailable ? localStorage.getItem('settings') : null

	if (getValueFromLocalStorage !== null && localStorageAvailable) {
		const value = JSON.parse(getValueFromLocalStorage)
		store.set(value)
	}

	store.subscribe((value) => {
		if (localStorageAvailable) {
			localStorage.setItem('settings', JSON.stringify(value))
		}
	})

	return store
}

export const settingsStore = createSettingsStore()
