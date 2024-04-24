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
	},
	{
		id: 4,
		title: `Toggle Theme`,
		emoji: '🔨',
		delay: 20,
		run: () => {
			if (get(settingsStore).theme === 'light') {
				const darkTheme = themes.find((t) => t.name === 'dark')
				settingsStore.set({
					...get(settingsStore),
					theme: darkTheme?.name!,
					codeTheme: darkTheme?.codeTheme
				})
			} else {
				const lightTheme = themes.find((t) => t.name === 'light')

				settingsStore.set({
					...get(settingsStore),
					theme: lightTheme?.name!,
					codeTheme: lightTheme?.codeTheme
				})
			}
		},
		category: 'Settings'
	}
]

function createCommandsStore() {
	const { subscribe, set, update } = writable<CommandProps[]>(initialCommands)

	function addCommand(newCommand: CommandProps) {
		update((commands) => {
			const isDuplicateCommand = commands.find((command) => command.id === newCommand.id)

			if (isDuplicateCommand) {
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
	id: 3,
	title: 'Go to Uses',
	emoji: '🔗',
	delay: 20,
	run: () => {
		navigate('/uses')
	},
	category: 'Pages'
})
