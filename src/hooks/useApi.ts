'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  immediate?: boolean
  deps?: unknown[]
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
) {
  const { immediate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async (queryUrl?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(queryUrl || url)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to fetch')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (immediate) fetch_()
  }, [immediate, fetch_])

  return { data, loading, error, refetch: fetch_ }
}

export async function apiPost<T>(url: string, body: unknown): Promise<{ data?: T; error?: string; success: boolean }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    return json
  } catch {
    return { success: false, error: 'Network error' }
  }
}

export async function apiPatch<T>(url: string, body: unknown): Promise<{ data?: T; error?: string; success: boolean }> {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    return json
  } catch {
    return { success: false, error: 'Network error' }
  }
}

export async function apiDelete(url: string): Promise<{ error?: string; success: boolean }> {
  try {
    const res = await fetch(url, { method: 'DELETE' })
    const json = await res.json()
    return json
  } catch {
    return { success: false, error: 'Network error' }
  }
}
