export const links = [
  { name: 'Home', url: '/', icon: 'ri:home-heart-line' },
  { name: 'Blog', url: '/blog', icon: 'mdi:book-minus-outline' },
  { name: 'Snippets', url: '/snippets', icon: 'mdi:treasure-chest-outline' },
  { name: 'Tools', url: '/tools', icon: 'mdi:toolbox-outline' },
] as const

export const mobileLinks = links.slice(0, 3)
