'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Set visible immediately on mount
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Hide content briefly during navigation
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.1s' }}>
      {children}
    </div>
  )
}