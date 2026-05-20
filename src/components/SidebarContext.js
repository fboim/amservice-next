'use client'

import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext({
  mobileOpen: false,
  setMobileOpen: () => {},
  onMobileClose: () => {},
  onMobileOpen: () => {},
})

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const onMobileClose = () => setMobileOpen(false)
  const onMobileOpen = () => setMobileOpen(true)

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