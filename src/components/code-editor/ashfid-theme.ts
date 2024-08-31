import { createTheme } from 'thememirror'
import { tags as t } from '@lezer/highlight'

export const myTheme = createTheme({
	variant: 'dark',
	settings: {
		background: '#272335',
		foreground: '#ffffff',
		caret: '#40a2ed',
		selection: '#1382d8',
		lineHighlight: '#8a91991a',
		gutterBackground: '#2f2c3a',
		gutterForeground: '#8a919966'
	},
	styles: [
		{
			tag: t.comment,
			color: '#8f8f8f'
		},
		{
			tag: t.variableName,
			color: '#16cfe3'
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#ffdd00'
		},
		{
			tag: t.number,
			color: '#0fc4c7'
		},
		{
			tag: t.bool,
			color: '#3ec8c6'
		},
		{
			tag: t.null,
			color: '#e100ff'
		},
		{
			tag: t.keyword,
			color: '#fafafa'
		},
		{
			tag: t.operator,
			color: '#4e8ac6'
		},
		{
			tag: t.className,
			color: '#43d3e0'
		},
		{
			tag: t.definition(t.typeName),
			color: '#0682fe'
		},
		{
			tag: t.typeName,
			color: '#ff00a2'
		},
		{
			tag: t.angleBracket,
			color: '#5c6166'
		},
		{
			tag: t.tagName,
			color: '#00ffee'
		},
		{
			tag: t.attributeName,
			color: '#5c6166'
		}
	]
})
