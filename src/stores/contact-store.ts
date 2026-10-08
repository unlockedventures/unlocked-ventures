import { create } from 'zustand'

type ContactState = {
  sent: boolean
  setSent: (sent: boolean) => void
  reset: () => void
}

export const useContactStore = create<ContactState>((set) => ({
  sent: false,
  setSent: (sent) => set({ sent }),
  reset: () => set({ sent: false }),
}))
