<script lang="ts">
	import { navigate } from 'astro:transitions/client'
	import { settingsStore } from '$stores/settings-store'
	import Fuse from 'fuse.js'
	import { onMount, tick } from 'svelte'

	type Props = { id: number; title: string; emoji: string; fn: () => void }

	let isOpen = false
	let searchBar: HTMLInputElement

	let actions: Props[] = [
		{
			id: 1,
			title: 'Go to Snippets',
			emoji: '📃',
			fn: () => {
				navigate('/snippets')
			}
		},
		{
			id: 2,
			title: 'Fly to Blog',
			emoji: '📃',
			fn: () => {
				navigate('/blog')
			}
		},
		{
			id: 3,
			title: 'Head to Uses',
			emoji: '📃',
			fn: () => {
				navigate('/uses')
			}
		},
		{
			id: 4,
			title: `Toggle Theme`,
			emoji: '🎡',
			fn: () => {
				if ($settingsStore.theme === 'light') {
					$settingsStore.theme = 'dark'
				} else {
					$settingsStore.theme = 'light'
				}
			}
		}
	]

	const fuseInstance = new Fuse(actions, {
		keys: ['title'],
		shouldSort: true
	})

	let searchTerm = ''
	let results: Props[] = actions

	let firstTab: HTMLElement
	let lastTab: HTMLElement
	let dialog: HTMLDialogElement

	const els: HTMLButtonElement[] = []
	let hoverIndex = 0
	let selectedCommand: HTMLButtonElement

	onMount(() => {
		const focusables = dialog.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)

		firstTab = focusables[0] as HTMLElement
		lastTab = focusables[focusables.length - 1] as HTMLElement

		hoverIndex = 0
		selectedCommand = els[hoverIndex]
	})

	function trapTabKey(e: KeyboardEvent) {
		if (isOpen) {
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					if (document.activeElement === firstTab) {
						e.preventDefault()
						lastTab.focus()
					}
				} else {
					if (document.activeElement === lastTab) {
						e.preventDefault()
						firstTab.focus()
					}
				}
			}
		}
	}

	async function setOpen() {
		isOpen = !isOpen

		if (searchBar && isOpen) {
			await tick()
			searchBar.focus()
		}
	}

	$: searches = fuseInstance.search(searchTerm)

	$: {
		results = searches.map((res) => {
			return { id: res.item.id, title: res.item.title, fn: res.item.fn, emoji: res.item.emoji }
		})

		if (results.length == 0) {
			results = actions
		}
	}

	async function shortcut(e: KeyboardEvent) {
		if (e.ctrlKey && e.key === '/') {
			isOpen = true

			if (searchBar && isOpen) {
				await tick()
				searchBar.focus()
			}
		}

		if (e.key === 'Escape' && isOpen) {
			isOpen = false
		}
	}

	function runAction(e: Event) {
		if (!(e.currentTarget instanceof HTMLButtonElement)) return

		let getActionId = +e.currentTarget.getAttribute('data-action-id')!

		if (!getActionId) return

		const action = actions.find((action) => action.id === getActionId)

		action?.fn()
	}

	$: {
		if (searchTerm) {
			hoverIndex = 0
		}
	}

	$: selectedCommand ? assignNewElement(els[hoverIndex]) : null

	function assignNewElement(newElement: HTMLButtonElement) {
		if (selectedCommand) {
			selectedCommand.removeAttribute('data-highlight')
		}

		selectedCommand = newElement
		selectedCommand.setAttribute('data-highlight', '')

		return selectedCommand
	}

	function cycleThroughList(e: KeyboardEvent) {
		if (!isOpen) return
		if (e.key === 'ArrowDown') {
			hoverIndex = (hoverIndex + 1) % results.length
			assignNewElement(els[hoverIndex])
			e.preventDefault()
		}

		if (e.key === 'ArrowUp') {
			hoverIndex = (hoverIndex - 1 + results.length) % results.length
			assignNewElement(els[hoverIndex])
			e.preventDefault()
		}

		if (e.key === 'Enter' && selectedCommand) {
			selectedCommand.click()
		}
	}

	$: console.log(hoverIndex)
</script>

<svelte:body on:keydown={shortcut} />

<button class="rounded-md bg-input p-2 font-mono font-bold tracking-widest" on:click={setOpen}
	>Command Palette
	<span>⌘</span><span>K</span>
</button>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="fixed bg-input w-2/4 max-w-4xl inset-0 bottom-[25vh] z-[100] p-2 space-y-2"
	open={isOpen}
	bind:this={dialog}
	on:keydown={trapTabKey}
	on:keydown={cycleThroughList}
>
	<div>
		<!-- Search Box -->
		<input
			id="command-palette-input"
			class="text-3xl w-full p-2 focus:outline-0 focus:ring-1 focus:ring-input-focus"
			bind:value={searchTerm}
			bind:this={searchBar}
			autocomplete="off"
		/>
		<!-- Content Box -->
		<ul class="space-y-2 h-96 overflow-y-auto text-xl font-heading">
			{#each results as result, i}
				<li>
					<button
						on:click={runAction}
						class="flex gap-4 items-center w-full p-4 data-[highlight]:bg-[red]"
						data-action-id={result.id}
						bind:this={els[i]}
					>
						<span>{result.emoji}</span>
						<span>{result.title}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</dialog>

<button
	class="fixed inset-0 bg-[black] bg-opacity-50 z-[90]"
	class:hidden={!isOpen}
	tabindex="-1"
	on:click={setOpen}
>
</button>
