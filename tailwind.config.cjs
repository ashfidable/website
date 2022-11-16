/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				"primary": {
					DEFAULT: "hsl(var(--color-primary) / <alpha-value> )",
					"light": "hsl(var(--color-primary-light) / <alpha-value> )"
				}
			}
		},
	},
	plugins: [],
}
