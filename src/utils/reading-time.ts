import calculateReadingTime from 'reading-time'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'

export function getReadingTime(text: string) {
	if (!text || !text.length) return undefined
	try {
		const { minutes } = calculateReadingTime(toString(fromMarkdown(text)), {
			wordsPerMinute: 150
		})
		if (minutes && minutes > 0) {
			const minuteOrMinutes = minutes > 1 ? 'mins' : 'min'
			return `${Math.ceil(minutes)} ${minuteOrMinutes} read`
		}
		return undefined
	} catch (e) {
		return undefined
	}
}
