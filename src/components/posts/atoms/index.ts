import H1 from '$components/posts/atoms/h1.astro'
import H2 from '$components/posts/atoms/h2.astro'
import H3 from '$components/posts/atoms/h3.astro'
import H4 from '$components/posts/atoms/h4.astro'
import P from '$components/posts/atoms/p.astro'
import BlockQuote from '$components/posts/atoms/blockquote.astro'
import A from '$components/posts/atoms/a.astro'
import OL from '$components/posts/atoms/ol.astro'
import UL from '$components/posts/atoms/ul.astro'
import Image from '$components/posts/atoms/image.astro'

export const components = {
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	blockquote: BlockQuote,
	a: A,
	p: P,
	ol: OL,
	ul: UL,
	img: Image
}
