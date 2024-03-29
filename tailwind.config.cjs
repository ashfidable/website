import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

	theme: {
		backgroundColor: {
			background: 'var(--color-background)',
			body: 'var(--color-background-body)',
			card: 'var(--color-background-card)',
			category: 'var(--color-category-background)',
			button: 'var(--color-button-normal)',
			'button-active': 'var(--color-button-active)',
			'button-hover': 'var(--color-button-hover)',
			'spotify-progress': 'var(--color-spotify-progress)',
			'spotify-progress-outer': 'var(--color-spotify-progress-background)',
			input: 'var(--color-input-background)',
			blockquote: 'var(--color-blockquote-background)'
		},
		textColor: {
			body: 'var(--color-body-text)',

			'button-text-active': 'var(--color-button-text-active)',
			heading: 'var(--color-heading-text)',
			'heading-hover': 'var(--color-heading-text-hover)',
			'datetime-text': 'var(--color-card-date-text)',
			'icon-hover': 'var(--color-icon-hover)',
			icon: 'var(--color-icon)',
			'category-icon': 'var(--color-category-text)',
			'blockquote-text': 'var(--color-blockquote-text)'
		},
		borderColor: {
			highlight: 'var(--color-border-highlight)',
			'category-highlight': 'var(--color-category-highlight)',
			'highlight-hover': 'var(--color-border-highlight-hover)',
			'blockquote-indicator': 'var(--color-blockquote-indicator)'
		},
		textDecorationColor: {
			link: 'var(--color-link)',
			'link-hover': 'var(--color-link-hover)'
		},
		ringColor: {
			'input-normal': 'var(--color-input-ring-normal)',
			'input-focus': 'var(--color-input-ring-focus)'
		},
		colors: {
			red: colors.red[500]
		},
		extend: {
			backgroundImage: {
				'category-gradient': 'var(--color-category-background)'
			},
			gridTemplateColumns: {
				'sidebar-layout': '14rem 1fr'
			},
			fontFamily: {
				stylized: 'var(--font-stylized)',
				heading: 'var(--font-heading)',
				sans: ['Inter', 'sans-serif']
			},
			animation: {
				wave: 'wave-animation 2.5s linear infinite'
			},
			colors: {
				cyan: colors.cyan,
				violet: colors.violet
			}
		}
	},
	plugins: []
}
