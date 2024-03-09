import { Book, Bookmark, ScissorsSquare, Component, Home } from 'lucide-astro'

export const Links = [
	{
		name: 'Home',
		url: '/',
		icon: 'mdi:home-heart'
	},
	{
		name: 'Blog',
		url: '/blog',
		icon: 'mdi:book-minus-outline'
	},
	{
		name: 'Bookmarks',
		url: '/bookmarks',
		icon: 'mdi:tag-outline'
	},
	{
		name: 'Snippets',
		url: '/snippets',
		icon: 'mdi:treasure-chest-outline'
	},
	{
		name: 'Uses',
		url: '/uses',
		icon: 'mdi:toolbox-outline'
	}
]

export const MobileLinks = [
	{
		name: 'Home',
		url: '/',
		icon: 'mdi:home-heart'
	},
	{
		name: 'Blog',
		url: '/blog',
		icon: 'mdi:book-minus-outline'
	},
	{
		name: 'Snippets',
		url: '/snippets',
		icon: 'mdi:treasure-chest-outline'
	}
]
