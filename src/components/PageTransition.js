'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition() {
  const pathname = usePathname()

  useEffect(() => {
    // Prevent animation on mount
    document.body.classList.add('page-transitioning')
    const timer = setTimeout(() => {
      document.body.classList.remove('page-transitioning')
    }, 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}