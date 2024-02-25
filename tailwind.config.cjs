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
			// fontSize: {
			// 	sm: 'var(--font-size-sm)',
			// 	base: 'var(--font-size-base)',
			// 	lg: 'var(--font-size-lg)',
			// 	xl: 'var(--font-size-xl)',
			// 	'2xl': 'var(--font-size-2xl)',
			// 	'3xl': 'var(--font-size-3xl)',
			// 	'4xl': 'var(--font-size-4xl)',
			// 	'5xl': 'var(--font-size-5xl)',
			// 	'6xl': 'var(--font-size-6xl)',
			// 	'7xl': 'var(--font-size-7xl)',
			// 	'8xl': 'var(--font-size-8xl)',
			// 	'9xl': 'var(--font-size-9xl)'
			// },
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
