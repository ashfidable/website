import { get, writable } from 'svelte/store'
import { settingsStore } from './settings-store'
import { navigate } from 'astro:transitions/client'

export type CommandProps = {
	id: number
	title: string
	emoji: string
	run: () => void
	category: string
	delay?: number
}

let initialCommands: CommandProps[] = [
	{
		id: 1,
		title: 'Go to Snippets',
		emoji: '🔗',
		delay: 20,
		run: () => {
			navigate('/snippets')
		},
		category: 'Pages'
	},
	{
		id: 2,
		title: 'Fly to Blog',
		emoji: '🔗',
		delay: 20,
		run: () => {
			navigate('/blog')
		},
		category: 'Pages'
	},
	{
		id: 3,
		title: 'Head to Uses',
		emoji: '🔗',
		delay: 20,
		run: () => {
			navigate('/uses')
		},
		category: 'Pages'
	},
	{
		id: 4,
		title: `Toggle Theme`,
		emoji: '🔨',
		delay: 20,
		run: () => {
			if (get(settingsStore).theme === 'light') {
				settingsStore.set({
					theme: 'dark',
					...settingsStore
				})
			} else {
				settingsStore.set({
					theme: 'light',
					...settingsStore
				})
			}
		},
		category: 'Settings'
	}
]

function createCommandsStore() {
	const { subscribe, set, update } = writable<CommandProps[]>(initialCommands)

	return {
		subscribe,
		addCommand: (command: CommandProps) => update((commands) => [...commands, command])
	}
}

export const commandsStore = createCommandsStore()
