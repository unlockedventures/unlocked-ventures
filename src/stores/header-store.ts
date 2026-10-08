import { create } from 'zustand'

type HeaderState = {
  pageScrolled: boolean
  menuScrolled: boolean
  setPageScrolled: (scrolled: boolean) => void
  setMenuScrolled: (scrolled: boolean) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
  pageScrolled: false,
  menuScrolled: false,
  setPageScrolled: (pageScrolled) => set({ pageScrolled }),
  setMenuScrolled: (menuScrolled) => set({ menuScrolled }),
}))
