<script lang="ts">
	import { EditorView, basicSetup } from 'codemirror'
	import { html } from '@codemirror/lang-html'
	import { css } from '@codemirror/lang-css'
	import { LanguageSupport } from '@codemirror/language'
	import { javascript } from '@codemirror/lang-javascript'
	import { EditorState } from '@codemirror/state'
	import prettier from 'prettier'
	import pluginHtml from 'prettier/plugins/html'
	import pluginCss from 'prettier/plugins/postcss'
	import pluginJS from 'prettier/plugins/babel'
	import pluginESTree from 'prettier/plugins/estree'
	import { myTheme } from './ashfid-theme.ts'
	import { onMount } from 'svelte'
	import PrettierIcon from './icons/prettier-icon.svelte'
	import LoadingSpinner from './icons/loading-spinner.svelte'
	import TwoColumnIcon from './icons/two-column-icon.svelte'
	import TwoRowIcon from './icons/two-row-icon.svelte'
	import ResetIcon from './icons/reset-icon.svelte'

	enum CodeType {
		HTML,
		CSS,
		JS
	}
	interface Props {
		title?: string
		baseHtml?: string
		baseStyles?: string
		baseScript?: string
	}

	let {
		title = 'Code Editor',
		baseHtml = $bindable(`<button>Click    </button>`),
		baseStyles = $bindable(`body { background: #2d303e; }`),
		baseScript = $bindable(`const buttonReference = document.querySelector('button');buttonReference.addEventListener('click', () => alert("Hello"))
	`)
	}: Props = $props()

	const resetHTML = baseHtml
	const resetStyle = baseStyles
	const resetScript = baseScript

	let editorElement: HTMLElement
	let editorView: EditorView

	let isFormatting = $state(false)
	let isResetting = $state(false)
	let isTwoColumn = $state(true)

	let debounceTimeout: ReturnType<typeof setTimeout>
	let debounceSeconds: number = 250

	let currentCodeType = $state(CodeType.HTML)

	let src = $derived(
		`<html>
			<head>
				<${''}style>${baseStyles}<${''}/style>
			</head>
			<body>${baseHtml}</body>
			<${''}script>${baseScript}<${''}/script>
		</html>`
	)

	const createEditorState = (
		doc: string,
		language: LanguageSupport,
		updateDoc: (doc: string) => {}
	) =>
		EditorState.create({
			doc,
			extensions: [
				basicSetup,
				language,
				myTheme,
				EditorView.lineWrapping,
				EditorView.updateListener.of((v) => {
					if (v.docChanged) {
						clearTimeout(debounceTimeout)
						debounceTimeout = setTimeout(() => {
							updateDoc(v.state.doc.toString())
						}, debounceSeconds)
					}
				})
			]
		})

	let editorState: EditorState = $derived.by(() => {
		switch (currentCodeType) {
			case CodeType.HTML:
				return createEditorState(baseHtml, html(), (doc) => (baseHtml = doc))
			case CodeType.CSS:
				return createEditorState(baseStyles, css(), (doc) => (baseStyles = doc))
			case CodeType.JS:
				return createEditorState(baseScript, javascript(), (doc) => (baseScript = doc))
		}
	})

	const format = async () => {
		switch (currentCodeType) {
			case CodeType.HTML:
				return await prettier.format(baseHtml, {
					parser: 'html',
					plugins: [pluginHtml, pluginCss, pluginESTree, pluginJS]
				})
			case CodeType.CSS:
				return await prettier.format(baseStyles, {
					parser: 'css',
					plugins: [pluginCss]
				})
			case CodeType.JS:
				return await prettier.format(baseScript, {
					parser: 'babel',
					plugins: [pluginESTree, pluginJS]
				})
		}
	}

	const changeCodeType = async (newCodeType: CodeType) => {
		currentCodeType = newCodeType
		editorView.setState(editorState)
		editorView?.dispatch({
			changes: { from: 0, to: editorView.state.doc.toString().length, insert: await format() }
		})
	}

	const resetEditor = async () => {
		if (isResetting) return
		isResetting = true
		await new Promise((r) => setTimeout(r, 150))

		baseHtml = resetHTML
		baseStyles = resetStyle
		baseScript = resetScript
		changeCodeType(currentCodeType)

		isResetting = false
	}

	onMount(async () => {
		editorView = new EditorView({
			state: createEditorState(baseHtml, html(), (doc) => (baseHtml = doc)),
			parent: editorElement
		})

		changeCodeType(CodeType.HTML)
	})
</script>

<div class="rounded-md overflow-hidden bg-card pb-2 border border-b-4 border-highlight">
	<header
		class="font-heading flex items-center justify-between px-4 py-2 border-b-2 border-b-highlight-hover"
	>
		<span class="font-semibold">{title}</span>
		<div class="flex gap-2 text-lg">
			<button
				class="hover:text-xl"
				onclick={async () => {
					if (isFormatting) return
					isFormatting = true
					const string = await format()

					editorView?.dispatch({
						changes: { from: 0, to: editorView.state.doc.toString().length, insert: string }
					})
					await new Promise((r) => setTimeout(r, 500))
					isFormatting = false
				}}
			>
				<span class="sr-only">{isFormatting ? 'Formatting in Progress' : 'Format'}</span>
				{#if !isFormatting}
					<PrettierIcon />
				{:else}
					<LoadingSpinner />
				{/if}
			</button>

			<button
				class="hover:text-xl"
				onclick={() => (isTwoColumn = !isTwoColumn)}
				class:text-icon-hover={isTwoColumn}
			>
				<span class="sr-only">{isTwoColumn ? 'Two Column Layout' : 'One Column Layout'}</span>
				{#if isTwoColumn}
					<TwoColumnIcon />
				{:else}
					<TwoRowIcon />
				{/if}
			</button>

			<button class="hover:text-xl" onclick={resetEditor}>
				<span class="sr-only">Reset</span>
				{#if isResetting}
					<LoadingSpinner />
				{:else}
					<ResetIcon />
				{/if}
			</button>
		</div>
	</header>
	<!-- Editor and Result -->
	<div class="grid bg-card px-2 overflow-hidden" class:grid-cols-2={isTwoColumn}>
		<!-- Editor -->
		<section>
			<header class="flex gap-4 py-2">
				<button
					class:font-bold={currentCodeType === CodeType.HTML}
					class:border-b={currentCodeType === CodeType.HTML}
					class="uppercase font-heading border-highlight-hover"
					onclick={() => changeCodeType(CodeType.HTML)}>html</button
				>
				<button
					class:font-bold={currentCodeType === CodeType.CSS}
					class:border-b={currentCodeType === CodeType.CSS}
					class="uppercase font-heading border-highlight-hover"
					onclick={() => changeCodeType(CodeType.CSS)}>css</button
				>
				<button
					class:font-bold={currentCodeType === CodeType.JS}
					class:border-b={currentCodeType === CodeType.JS}
					class="uppercase font-heading border-highlight-hover"
					onclick={() => changeCodeType(CodeType.JS)}>javascript</button
				>
			</header>
			<div>
				<div bind:this={editorElement}></div>
			</div>
		</section>
		<!-- Result -->
		<section>
			<header class="font-bold uppercase font-heading tracking-wide py-2 pl-2">Output</header>
			<iframe
				title="code-preview"
				srcdoc={src}
				height="100%"
				width="100%"
				class="h-[400px] border-l-highlight-hover block"
				class:border-l-2={isTwoColumn}
				sandbox="allow-scripts allow-modals allow-same-origin"
			></iframe>
		</section>
	</div>
</div>

<style>
	:global(.cm-editor) {
		height: 400px;
	}
</style>
