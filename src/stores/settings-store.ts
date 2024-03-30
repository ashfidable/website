import { writable } from 'svelte/store'

interface Settings {
	theme: string
	codeTheme?: string
	rounded?: boolean
}

// Create the custom store
function localStorageWritable<T>(key: string, initialValue: T) {
	// Create a writable store
	const store = writable(initialValue)

	const localStorageAvailable = typeof localStorage !== 'undefined'
	const savedValue = localStorageAvailable ? localStorage.getItem(key) : null

	if (savedValue !== null && localStorageAvailable) {
		store.set(JSON.parse(savedValue))
	}

	if (savedValue === null && localStorageAvailable) {
		store.set(JSON.parse(JSON.stringify(initialValue)))
	}

	// Subscribe to changes and save to local storage
	store.subscribe((value) => {
		if (localStorageAvailable) {
			localStorage.setItem(key, JSON.stringify(value))
		}
	})

	return store
}

export const settingsStore = localStorageWritable<Settings>('settings', {
	theme: 'dark',
	codeTheme: 'default',
	rounded: true
})
