import { create } from 'zustand'

type NavState = {
  open: boolean
  activeHref: string | null
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setActiveHref: (href: string | null) => void
  toggleActiveHref: (href: string) => void
  reset: () => void
}

export const useNavStore = create<NavState>((set) => ({
  open: false,
  activeHref: null,
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((state) => ({ open: !state.open })),
  setActiveHref: (activeHref) => set({ activeHref }),
  toggleActiveHref: (href) =>
    set((state) => ({ activeHref: state.activeHref === href ? null : href })),
  reset: () => set({ open: false, activeHref: null }),
}))
