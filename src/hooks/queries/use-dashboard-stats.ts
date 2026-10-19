'use client'

import { useQuery } from '@tanstack/react-query'

export type DashboardStats = {
  users: number
  media: number
  awards: number
  'news-posts': number
  'podcast-audio': number
  'podcast-channels': number
  'podcast-episodes': number
  'contact-messages': number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats', {
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard statistics')
  }

  return response.json()
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
