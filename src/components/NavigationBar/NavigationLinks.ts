import { Book, Bookmark, ScissorsSquare, Component, Home } from 'lucide-astro'

export const Links = [
	{
		name: 'Home',
		url: '/',
		icon: Home
	},
	{
		name: 'Blog',
		url: '/blog',
		icon: Book
	},
	{
		name: 'Bookmarks',
		url: '/bookmarks',
		icon: Bookmark
	},
	{
		name: 'Snippets',
		url: '/snippets',
		icon: ScissorsSquare
	},
	{
		name: 'Uses',
		url: '/uses',
		icon: Component
	}
]

export const MobileLinks = [
	{
		name: 'Home',
		url: '/',
		icon: Home
	},
	{
		name: 'Blog',
		url: '/blog',
		icon: Book
	},
	{
		name: 'Snippets',
		url: '/snippets',
		icon: ScissorsSquare
	}
]
