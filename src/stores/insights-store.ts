import { create } from 'zustand'

export const INSIGHTS_PAGE_SIZE = 8

type InsightsState = {
  visibleCount: number
  showMore: () => void
  reset: () => void
}

export const useInsightsStore = create<InsightsState>((set) => ({
  visibleCount: INSIGHTS_PAGE_SIZE,
  showMore: () => set((state) => ({ visibleCount: state.visibleCount + INSIGHTS_PAGE_SIZE })),
  reset: () => set({ visibleCount: INSIGHTS_PAGE_SIZE }),
}))
