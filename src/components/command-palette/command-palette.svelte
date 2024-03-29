<script lang="ts">
	import { navigate } from 'astro:transitions/client'
	import { settingsStore } from '$stores/settings-store'
	import Fuse from 'fuse.js'
	import { onMount, tick } from 'svelte'
	import { fade } from 'svelte/transition'

	interface CommandProps {
		id: number
		title: string
		emoji: string
		run: () => void
		category: string
	}

	let isOpen = false
	let searchBar: HTMLInputElement

	let commands: CommandProps[] = [
		{
			id: 1,
			title: 'Go to Snippets',
			emoji: '📃',
			run: () => {
				isOpen = false
				setTimeout(() => {
					navigate('/snippets')
				}, 10)
			},
			category: 'Page'
		},
		{
			id: 2,
			title: 'Fly to Blog',
			emoji: '📃',
			run: () => {
				isOpen = false
				setTimeout(() => {
					navigate('/blog')
				}, 10)
			},
			category: 'Page'
		},
		{
			id: 3,
			title: 'Head to Uses',
			emoji: '📃',
			run: () => {
				isOpen = false
				setTimeout(() => {
					navigate('/uses')
				}, 10)
			},
			category: 'Page'
		},
		{
			id: 4,
			title: `Toggle Theme`,
			emoji: '🔨',
			run: () => {
				isOpen = false
				if ($settingsStore.theme === 'light') {
					$settingsStore.theme = 'dark'
				} else {
					$settingsStore.theme = 'light'
				}
			},
			category: 'Settings'
		}
	]

	const fuseInstance = new Fuse(commands, {
		keys: ['title'],
		shouldSort: true
	})

	let searchTerm = ''

	let firstTab: HTMLElement
	let lastTab: HTMLElement
	let dialog: HTMLElement

	let commandButtons: HTMLButtonElement[] = []
	let hoverIndex = 0
	let selectedCommand: HTMLButtonElement

	$: searches = fuseInstance.search(searchTerm)

	$: results =
		searches.length > 0
			? searches.map((res) => {
					return {
						id: res.item.id,
						title: res.item.title,
						run: res.item.run,
						emoji: res.item.emoji,
						category: res.item.category
					}
			  })
			: commands

	let filteredCommands: Record<string, CommandProps[]> = {}

	$: {
		filteredCommands = {}
		for (const command of results) {
			if (!filteredCommands[command.category]) {
				filteredCommands[command.category] = []
			}
			filteredCommands[command.category].push(command)
		}

		if (dialog) commandButtons = [...dialog?.querySelectorAll('button')]
	}

	$: if (searchTerm) hoverIndex = 0

	$: selectedCommand ? switchSelectedCommand(commandButtons[hoverIndex]) : null

	const init = () => {
		const focusables = dialog.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)

		firstTab = focusables[0] as HTMLElement
		lastTab = focusables[focusables.length - 1] as HTMLElement
	}

	const switchSelectedCommand = (newElement: HTMLButtonElement) => {
		if (selectedCommand) {
			selectedCommand.removeAttribute('data-highlight')
		}

		selectedCommand = newElement
		selectedCommand?.setAttribute('data-highlight', '')

		return selectedCommand
	}

	const tabTrapFocus = (e: KeyboardEvent) => {
		if (isOpen && e.key === 'Tab') {
			const activeElement = document.activeElement
			const focusElement = e.shiftKey ? lastTab : firstTab
			const activeTab = e.shiftKey ? firstTab : lastTab

			if (activeElement === activeTab) {
				e.preventDefault()
				focusElement.focus()
			}
		}
	}

	const setOpen = async () => {
		isOpen = !isOpen

		if (searchBar && isOpen) {
			await tick()
			searchBar.focus()
			hoverIndex = 0
			switchSelectedCommand(commandButtons[hoverIndex])
		}
	}

	const keyboardShortcuts = async (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === '/' && !isOpen) {
			isOpen = true
			if (searchBar && isOpen) {
				await tick()
				searchBar.focus()
				hoverIndex = 0
				switchSelectedCommand(commandButtons[hoverIndex])
			}
		}

		if (e.key === 'Escape' && isOpen) {
			isOpen = false
		}
	}

	const run = (e: Event) => {
		if (!(e.currentTarget instanceof HTMLButtonElement)) return

		let getCommandId = +e.currentTarget.getAttribute('data-action-id')!

		if (!getCommandId) return

		const command = commands.find((action) => action.id === getCommandId)

		command?.run()
	}

	const cycleThroughCommands = (e: KeyboardEvent) => {
		if (!isOpen) return
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			hoverIndex = (hoverIndex + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
			e.preventDefault()
			switchSelectedCommand(commandButtons[hoverIndex])
		} else if (e.key === 'Enter' && selectedCommand) {
			selectedCommand.click()
		}
	}

	onMount(() => {
		init()

		hoverIndex = 0
		switchSelectedCommand(commandButtons[hoverIndex])
	})
</script>

<svelte:body on:keydown={keyboardShortcuts} />

<button
	class="rounded-md bg-button-active p-1 px-2 font-bold text-button-text-active flex gap-2 items-center font-heading tracking-wide"
	on:click={setOpen}
	>Command Palette
	<div class="p-1 rounded-md bg-body text-body flex gap-2">
		<span>⌘</span><span>L</span>
	</div>
</button>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="bg-body w-2/4 max-w-4xl inset-0 bottom-[30vh] z-[100] rounded-md p-2 border border-highlight"
	open={isOpen}
	bind:this={dialog}
	on:keydown={tabTrapFocus}
	on:keydown={cycleThroughCommands}
	transition:fade
>
	<div class="space-y-4">
		<!-- Search Box -->
		<input
			id="command-palette-input"
			class="text-sm w-full p-1 focus:outline-0 focus:border-highlight-hover rounded-md border border-[transparent]"
			bind:value={searchTerm}
			bind:this={searchBar}
			autocomplete="off"
		/>
		<!-- Content Box -->
		<ul class="space-y-2 h-96 overflow-y-auto text-sm font-heading">
			<!-- {#each results as result, i}
				<li>
					<button
						on:click={run}
						class="flex gap-4 items-center w-full p-2 data-[highlight]:bg-button-active data-[highlight]:text-button-text-active bg-card rounded-md hover:bg-button-hover hover:text-button-text-active data-[highlight]:font-bold"
						data-action-id={result.id}
						bind:this={commandButtons[i]}
					>
						<span>{result.emoji}</span>
						<span>{result.title}</span>
					</button>
				</li>
			{/each} -->
			{#each Object.keys(filteredCommands) as command, i}
				<section class="space-y-2">
					<h4 class="font-bold">{command}</h4>
					<ul class="space-y-2">
						{#each filteredCommands[command] as cmd, index}
							<li>
								<button
									on:click={run}
									class=" w-full p-2 data-[highlight]:bg-button-active data-[highlight]:text-button-text-active bg-card rounded-md hover:bg-button-hover hover:text-button-text-active data-[highlight]:font-bold group transition-colors duration-75 ease-in-out"
									data-action-id={cmd.id}
								>
									<span class="group-data-[highlight]:ml-2 flex gap-4 items-center">
										<span>{cmd.emoji}</span>
										<span>{cmd.title}</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</ul>
	</div>
</dialog>

<button
	class="fixed inset-0 bg-[black] bg-opacity-70 z-[90]"
	class:hidden={!isOpen}
	tabindex="-1"
	on:click={setOpen}
>
</button>
