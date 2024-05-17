import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

	theme: {
		extend: {
			accentColor: {
				base: 'var(--color-input-accent)'
			},
			backgroundColor: {
				background: 'var(--color-background)',
				body: 'var(--color-background-body)',
				card: 'var(--color-card-background)',
				'card-hover': 'var(--color-card-background-hover)',
				category: 'var(--color-category-background)',
				button: 'var(--color-button-normal)',
				'button-active': 'var(--color-button-active)',
				'button-hover': 'var(--color-button-hover)',
				'spotify-progress': 'var(--color-spotify-progress)',
				'spotify-progress-outer': 'var(--color-spotify-progress-background)',
				input: 'var(--color-input-background)',
				blockquote: 'var(--color-blockquote-background)'
			},
			backgroundImage: {
				background: 'var(--color-background)'
			},
			textColor: {
				body: 'var(--color-body-text)',
				'body-low-contrast': 'var(--color-body-text-low-contrast)',
				'button-text-active': 'var(--color-button-text-active)',
				heading: 'var(--color-heading-text)',
				'heading-hover': 'var(--color-heading-text-hover)',
				'datetime-text': 'var(--color-card-date-text)',
				'icon-hover': 'var(--color-icon-hover)',
				icon: 'var(--color-icon)',
				category: 'var(--color-category-text)',
				'blockquote-text': 'var(--color-blockquote-text)'
			},
			borderColor: {
				highlight: 'var(--color-border-highlight)',
				'category-highlight': 'var(--color-category-highlight)',
				'highlight-hover': 'var(--color-border-highlight-hover)',
				'blockquote-indicator': 'var(--color-blockquote-indicator)'
			},
			outlineColor: {
				highlight: 'var(--color-border-highlight)',
				'highlight-hover': 'var(--color-border-highlight-hover)'
			},
			textDecorationColor: {
				link: 'var(--color-link)',
				'link-hover': 'var(--color-link-hover)'
			},
			ringColor: {
				'input-normal': 'var(--color-input-ring-normal)',
				'input-focus': 'var(--color-input-ring-focus)'
			},
			gridTemplateColumns: {
				'sidebar-layout': '14rem 1fr'
			},
			fontFamily: {
				body: 'var(--font-body)',
				heading: 'var(--font-heading)'
			},
			fontSize: {
				base: 'clamp(.75rem, 3.5vw, 1rem)',
				xl: 'clamp(1rem, 3.5vw, 1.25rem)',
				'3xl': 'clamp(1.5rem, 3vw, 2.5rem)'
			},
			animation: {
				wave: 'wave-animation 2.5s linear infinite'
			},
			easing: {
				springy: 'var(--ease)'
			},
			borderRadius: {
				md: 'var(--rounded-radius)'
			}
		}
	},
	plugins: []
}
