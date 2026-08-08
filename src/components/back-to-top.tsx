import { useEffect, useState } from 'react'

export function BackToTop({ showThreshold = 150 }: { showThreshold?: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(document.documentElement.scrollTop > showThreshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showThreshold])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 hidden max-w-6xl p-4 md:block">
      {show && (
        <button
          className="back-to-top-enter pointer-events-auto absolute bottom-0 right-0 mr-4 rounded-md border border-site-border-hover bg-site-button-active text-6xl outline-none hover:bg-site-button-hover focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="sr-only">Scroll To Top</span>
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
          </svg>
        </button>
      )}
    </div>
  )
}
