import { get, writable } from 'svelte/store'
import { settingsStore } from './settings-store'
import { navigate } from 'astro:transitions/client'
import { themes } from '$components/settings/themes'

export type CommandProps = {
	id?: number
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
		title: 'Go to Blog',
		emoji: '🔗',
		delay: 20,
		run: () => {
			navigate('/blog')
		},
		category: 'Pages'
	},
	{
		id: 3,
		title: 'Go to Uses',
		emoji: '🔗',
		delay: 20,
		run: () => {
			navigate('/uses')
		},
		category: 'Pages'
	}
]

function createCommandsStore() {
	const { subscribe, set, update } = writable<CommandProps[]>(initialCommands)

	function addCommand(newCommand: CommandProps) {
		update((commands) => {
			const isDuplicateCommand = commands.find((command) => command.title === newCommand.title)

			if (isDuplicateCommand) {
				console.log(isDuplicateCommand)
				return [...commands]
			}

			let maxId = Math.max(...commands.map((item) => item.id ?? 0))
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
	emoji: '🔨',
	delay: 20,
	run: () => {
		settingsStore.toggleRounded()
	},
	category: 'Settings'
})

commandsStore.addCommand({
	title: `Toggle Dark Theme`,
	emoji: '🔨',
	delay: 20,
	run: () => {
		settingsStore.changeTheme('dark')
	},
	category: 'Settings'
})

commandsStore.addCommand({
	title: `Toggle Light Theme`,
	emoji: '🔨',
	delay: 20,
	run: () => {
		settingsStore.changeTheme('light')
	},
	category: 'Settings'
})
