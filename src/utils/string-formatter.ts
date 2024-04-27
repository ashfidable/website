export function convertToTitleCase(text: string) {
	return text
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export function highlightedText(text: string) {
	const firstWord = text.split(' ')[0] + ' '
	const restWords = text.substring(text.indexOf(' ') + 1)

	return {
		firstWord,
		restWords
	}
}

export function capitalizeString(inputString: string) {
	return inputString.charAt(0).toUpperCase() + inputString.slice(1)
}
