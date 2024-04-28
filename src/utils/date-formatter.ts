export function formatDate(date: Date) {
	let day = date.getDate()
	let monthName = date.toLocaleString('default', { month: 'long' })
	let year = date.getFullYear()

	let formattedDate = day + ' ' + monthName + ' ' + year

	return formattedDate
}

export function formatDateSlash(date: Date) {
	const formattedDate = date.toLocaleDateString('en-GB')
	return formattedDate
}
