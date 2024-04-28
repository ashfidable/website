import { writable } from 'svelte/store'
import { settingsStore } from './settings-store'
import { navigate } from 'astro:transitions/client'

export type CommandProps = {
	id?: number
	title: string
	emoji: string
	run: () => void
	category: string
	delay?: number
}

let initialCommands: CommandProps[] = []

function createCommandsStore() {
	const { subscribe, update } = writable<CommandProps[]>(initialCommands)

	function addCommand(newCommand: CommandProps) {
		update((commands) => {
			const isDuplicateCommand = commands.find((command) => command.title === newCommand.title)

			if (isDuplicateCommand) {
				return [...commands]
			}

			let maxId = commands.length > 0 ? Math.max(...commands.map((item) => item.id ?? 0)) : 0
			newCommand.id = maxId + 1

			return [...commands, newCommand]
		})
	}

	return {
		subscribe,
		addCommand
	}
}

export const commandsStore = createCommandsStore()

commandsStore.addCommand({
	title: `Toggle Rounded`,
	emoji: '⚙️',
	delay: 20,
	run: () => {
		settingsStore.toggleRounded()
	},
	category: 'Preferences'
})

commandsStore.addCommand({
	title: `Toggle Dark Theme`,
	emoji: '⚙️',
	delay: 20,
	run: () => {
		settingsStore.changeTheme('dark')
	},
	category: 'Preferences'
})

commandsStore.addCommand({
	title: `Toggle Light Theme`,
	emoji: '⚙️',
	delay: 20,
	run: () => {
		settingsStore.changeTheme('light')
	},
	category: 'Preferences'
})
