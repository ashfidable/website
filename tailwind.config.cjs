/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				stylized: 'var(--font-stylized)',
				heading: 'var(--font-heading)',
				sans: ['Inter', 'sans-serif']
			},
			animation: {
				wave: 'wave-animation 2.5s linear infinite'
			},
			colors: {
				primary: {
					DEFAULT: 'var(--color-primary)',
					tint: 'var(--color-primary-tint)',
					tone: 'var(--color-primary-tone)',
					shade: 'var(--color-primary-shade)'
				},
				accent: {
					DEFAULT: 'var(--color-accent)',
					tint: 'var(--color-accent-tint)',
					tone: 'var(--color-accent-tone)',
					shade: 'var(--color-accent-shade)'
				},
				'tag-primary': {
					DEFAULT: 'hsl(var(--primary-color) / <alpha-value> )'
				},
				'tag-secondary': {
					DEFAULT: 'hsl(var(--secondary-color) / <alpha-value> )'
				},
				'tag-accent': {
					DEFAULT: 'hsl(var(--accent-color) / <alpha-value> )'
				}
			}
		}
	},
	plugins: []
}
