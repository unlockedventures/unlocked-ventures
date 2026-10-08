import { create } from 'zustand'

export type RevealSectionId = 'locations' | 'about-delivered' | 'latest-news' | 'trusted-by'

type RevealEntry = {
  visible: boolean
  playId: number
}

type RevealState = {
  sections: Partial<Record<RevealSectionId, RevealEntry>>
  setInView: (id: RevealSectionId, inView: boolean) => void
  getSection: (id: RevealSectionId) => RevealEntry
}

const emptyEntry: RevealEntry = { visible: false, playId: 0 }

export const useRevealStore = create<RevealState>((set, get) => ({
  sections: {},
  getSection: (id) => get().sections[id] ?? emptyEntry,
  setInView: (id, inView) =>
    set((state) => {
      const current = state.sections[id] ?? emptyEntry
      return {
        sections: {
          ...state.sections,
          [id]: {
            visible: inView,
            playId: inView ? current.playId + 1 : current.playId,
          },
        },
      }
    }),
}))

export function useRevealSection(id: RevealSectionId) {
  return useRevealStore((state) => state.sections[id] ?? emptyEntry)
}
