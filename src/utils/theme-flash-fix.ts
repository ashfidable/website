// Script to fix the theme flash when switching pages ( View Transition fix )
function getSettings() {
	if (typeof localStorage !== undefined && localStorage.getItem('settings')) {
		return JSON.parse(localStorage.getItem('settings')!)
	}

	return null
}

function applySettings(newDocument: Document) {
	const element = newDocument.documentElement
	Object.keys(getSettings()).map((key) => {
		const value = getSettings()[key]

		if (key !== 'sound' && key !== 'version') {
			element.setAttribute(`data-${key}`, value)
		}
	})
}

document.addEventListener('astro:before-swap', (ev) => {
	if (getSettings()) {
		applySettings(ev.newDocument)
	}
})
