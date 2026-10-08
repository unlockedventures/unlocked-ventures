import { create } from 'zustand'

export const CASE_STUDIES_PAGE_SIZE = 8

type CaseStudiesState = {
  category: string
  visibleCount: number
  setCategory: (category: string) => void
  showMore: () => void
  reset: () => void
}

export const useCaseStudiesStore = create<CaseStudiesState>((set) => ({
  category: 'all',
  visibleCount: CASE_STUDIES_PAGE_SIZE,
  setCategory: (category) => set({ category, visibleCount: CASE_STUDIES_PAGE_SIZE }),
  showMore: () =>
    set((state) => ({ visibleCount: state.visibleCount + CASE_STUDIES_PAGE_SIZE })),
  reset: () => set({ category: 'all', visibleCount: CASE_STUDIES_PAGE_SIZE }),
}))
