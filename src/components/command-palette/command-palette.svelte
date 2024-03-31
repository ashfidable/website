<script lang="ts">
	import { commandsStore, type CommandProps } from '$stores/commands-store'
	import Fuse from 'fuse.js'

	import { onMount, tick } from 'svelte'
	import Button from '$components/button.svelte'

	let isOpen = false

	let commands: CommandProps[] = $commandsStore

	const fuseInstance = new Fuse($commandsStore, {
		keys: ['title'],
		shouldSort: true
	})

	let searchTerm: string = ''
	let commandDelayTimeout: number

	let firstTab: HTMLElement
	let lastTab: HTMLElement
	let dialog: HTMLElement

	let commandButtons: HTMLButtonElement[] = []
	let hoverIndex = 0
	let selectedCommand: HTMLButtonElement
	let searchBar: HTMLInputElement

	let results: CommandProps[]
	let filteredCommands: Record<string, CommandProps[]> = {}

	$: searches = fuseInstance.search(searchTerm)

	$: {
		results =
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
	}

	$: {
		filteredCommands = {}

		for (const command of results) {
			if (!filteredCommands[command.category]) {
				filteredCommands[command.category] = []
			}
			filteredCommands[command.category].push(command)
		}
	}

	$: if (searchTerm === '' || searchTerm) {
		hoverIndex = 0
	}

	$: selectedCommand ? switchSelectedCommand(commandButtons[hoverIndex]) : null

	$: selectedCommand?.scrollIntoView(false)

	const init = () => {
		const focusables = dialog.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)

		if (dialog && results.length > 0) {
			setTimeout(() => {
				commandButtons = [...dialog.querySelectorAll('button')]
			}, 1)
		}

		console.log('Mounted')

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
			searchTerm = ''
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
				searchTerm = ''
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

		if (!command) return

		isOpen = false

		if (command.delay) {
			clearTimeout(commandDelayTimeout)
			commandDelayTimeout = setTimeout(() => {
				command.run()
			}, command.delay)
		} else {
			command.run()
		}
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

		selectedCommand?.scrollIntoView(false)
	}

	onMount(async () => {
		init()

		if (dialog) commandButtons = [...dialog?.querySelectorAll('button')]

		hoverIndex = 0
		switchSelectedCommand(commandButtons[hoverIndex])
	})
</script>

<svelte:body on:keydown={keyboardShortcuts} />

<Button onclick={setOpen}>
	<span>Command Palette</span>
	<div class="p-1 px-2 rounded-md bg-body text-body flex gap-2">
		<span>⌘</span><span>/</span>
	</div>
</Button>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="bg-body w-2/4 max-w-4xl inset-0 bottom-[30vh] z-[100] rounded-md p-2 border border-highlight"
	open={isOpen}
	bind:this={dialog}
	on:keydown={tabTrapFocus}
	on:keydown={cycleThroughCommands}
>
	<div class="space-y-4">
		<!-- Search Box -->
		<input
			id="command-palette-input"
			class="text-sm w-full p-1 focus:outline-0 focus:border-highlight-hover rounded-md border-b border-[transparent] bg-input focus:ring-0"
			bind:value={searchTerm}
			bind:this={searchBar}
			autocomplete="off"
			on:input={(e) => {
				if (dialog && results.length > 0) {
					setTimeout(() => {
						commandButtons = [...dialog.querySelectorAll('button')]
					}, 1)
				}
			}}
		/>
		<!-- Content Box -->
		<!-- <ul class="space-y-2 h-96 overflow-y-auto text-sm font-heading">
			{#each results as result, i}
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
			{/each}
		</ul> -->
		<div class="h-72 overflow-y-auto space-y-2">
			{#each Object.keys(filteredCommands) as command, i}
				<section class="space-y-2">
					<h4 class="font-bold">{command}</h4>
					<ul class="space-y-2">
						{#each filteredCommands[command] as cmd}
							<li>
								<button
									on:click={run}
									class=" w-full p-2 data-[highlight]:bg-button-active data-[highlight]:text-button-text-active bg-card rounded-md hover:bg-button-hover hover:text-button-text-active data-[highlight]:font-bold group"
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
		</div>
	</div>
</dialog>

<button
	class="fixed top-0 left-0 w-full h-full bg-[black] bg-opacity-40 z-[60] backdrop-blur-sm"
	class:hidden={!isOpen}
	tabindex="-1"
	on:click={setOpen}
>
</button>
