import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '../types/auth'

export interface NavTabItem {
  key: string
  label: string
  path: string
  closable: boolean
}

interface UiState {
  collapsed: boolean
  themeMode: ThemeMode
  tabs: NavTabItem[]
  setCollapsed: (collapsed: boolean) => void
  toggleTheme: () => void
  openTab: (tab: NavTabItem) => void
  closeTab: (path: string) => void
  closeOtherTabs: (path: string) => void
  closeAllTabs: () => void
}

const DEFAULT_TAB: NavTabItem = {
  key: '/dashboard',
  label: '园所仪表盘',
  path: '/dashboard',
  closable: false,
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      collapsed: false,
      themeMode: 'light',
      tabs: [DEFAULT_TAB],
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleTheme: () =>
        set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
      openTab: (tab) =>
        set((state) => {
          const exists = state.tabs.some((item) => item.path === tab.path)
          if (exists) {
            return state
          }
          return { tabs: [...state.tabs, tab] }
        }),
      closeTab: (path) =>
        set((state) => ({ tabs: state.tabs.filter((item) => item.path !== path || !item.closable) })),
      closeOtherTabs: (path) =>
        set((state) => ({
          tabs: state.tabs.filter((item) => item.path === path || !item.closable),
        })),
      closeAllTabs: () => set({ tabs: [DEFAULT_TAB] }),
    }),
    {
      name: 'kg-ui-store',
      partialize: (state) => ({
        collapsed: state.collapsed,
        themeMode: state.themeMode,
      }),
    },
  ),
)
