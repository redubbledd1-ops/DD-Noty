import { useState, useEffect, useRef } from 'react'

export const useScrollHeader = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isScrollable, setIsScrollable] = useState(false)
  const lastScrollYRef = useRef(0)
  const scrollThresholdRef = useRef(0)
  const ticking = useRef(false)

  // Check if page is scrollable
  const checkScrollable = () => {
    const isMobile = window.innerWidth < 768
    if (!isMobile) {
      setIsScrollable(false)
      return
    }

    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const isPageScrollable = documentHeight > viewportHeight
    setIsScrollable(isPageScrollable)
  }

  // Handle scroll event
  const handleScroll = () => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const isMobile = window.innerWidth < 768

        // Only apply scroll-based hiding on mobile with scrollable content
        if (!isMobile || !isScrollable) {
          setIsHeaderVisible(true)
          ticking.current = false
          return
        }

        // Always show header at top of page
        if (currentScrollY < 10) {
          setIsHeaderVisible(true)
          lastScrollYRef.current = currentScrollY
          ticking.current = false
          return
        }

        // Determine scroll direction with threshold
        const scrollDelta = currentScrollY - lastScrollYRef.current
        const threshold = 5 // pixels

        if (Math.abs(scrollDelta) > threshold) {
          // Scrolling down
          if (scrollDelta > 0) {
            setIsHeaderVisible(false)
          }
          // Scrolling up
          else {
            setIsHeaderVisible(true)
          }
          scrollThresholdRef.current = currentScrollY
        }

        lastScrollYRef.current = currentScrollY
        ticking.current = false
      })
      ticking.current = true
    }
  }

  // Set up scroll listener and resize observer
  useEffect(() => {
    // Initial check
    checkScrollable()

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkScrollable, { passive: true })

    // Check scrollable content on mount and after content updates
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable()
    })

    resizeObserver.observe(document.documentElement)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkScrollable)
      resizeObserver.disconnect()
    }
  }, [isScrollable])

  return { isHeaderVisible, isScrollable }
}
