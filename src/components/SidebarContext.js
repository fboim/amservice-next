'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext({
  mobileOpen: false,
  setMobileOpen: () => {},
  onMobileClose: () => {},
  onMobileOpen: () => {},
})

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpenState] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('am_mobile_open')
    if (stored === 'true') {
      setMobileOpenState(true)
    }
  }, [])

  const setMobileOpen = (value) => {
    setMobileOpenState(value)
    localStorage.setItem('am_mobile_open', String(value))
  }

  const onMobileClose = () => {
    setMobileOpen(false)
  }

  const onMobileOpen = () => {
    setMobileOpen(true)
  }

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen, onMobileClose, onMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}