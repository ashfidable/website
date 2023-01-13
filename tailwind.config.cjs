/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				"stylized": 'Caveat Brush',
				"heading": "Raleway"
			},
			colors: {
				"primary": {
					DEFAULT: "hsl(var(--color-primary) / <alpha-value> )",
					"light": "hsl(var(--color-primary-light) / <alpha-value> )",
					"lighter": "hsl(var(--color-primary-lighter) / <alpha-value> )"
				},
				"accent": {
					DEFAULT: "var(--color-accent)",
					"light": "var(--color-accent-light)",
					"lighter": "var(--color-accent-lighter)",
				}
			}
		},
	},
	plugins: [],
}
