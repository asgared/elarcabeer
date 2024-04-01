import { supabase } from '@/utils/supabase-client'
import { useEffect, useState } from 'react'
import { useUserContext } from './useAuthUser'

const PAGE_COUNT = 6

export function useScrollData(
  type: 'generations' | 'community',
  data: any,
  containerRef: React.RefObject<HTMLDivElement> | null
) {
  const [loadedData, setLoadedData] = useState(data)
  const [offset, setOffset] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [isLast, setIsLast] = useState(false)

  const userContext = useUserContext()
  const user = userContext?.user

  const handleScroll = () => {
    if (containerRef?.current && typeof window !== 'undefined') {
      const container = containerRef.current
      const { bottom } = container.getBoundingClientRect()
      const { innerHeight } = window
      setIsInView(bottom <= innerHeight)
    }
  }

  const fetchData = async (offset: number) => {
    const from = offset * PAGE_COUNT
    const to = from + PAGE_COUNT - 1

    let records: any[] = []
    if (type === 'generations') {
      const { data } = await supabase
        .from(type)
        .select('*')
        .eq('user_id', user.id)
        .range(from, to)
        .order('created_at', { ascending: false })
      records = data ?? []
    }

    if (type === 'community') {
      const { data } = await supabase
        .from(type)
        .select('*')
        .eq('user_id', user.id)
        .eq('approved', 1)
        .range(from, to)
        .order('created_at', { ascending: false })
      records = data ?? []
    }

    return records ?? []
  }

  const loadMoreData = async (offset: number) => {
    setIsLoading(true)
    setOffset(prev => prev + 1)
    const newData = await fetchData(offset)
    setLoadedData((prevData: any) => [...prevData, ...newData])
    setIsLoading(false)
    if (newData.length < PAGE_COUNT) {
      setIsLast(true)
    }
  }

  useEffect(() => {
    if (isInView) {
      loadMoreData(offset)
    }
  }, [isInView])

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined

    const handleDebounceScroll = () => {
      clearTimeout(timer)
      if (!isLast) {
        timer = window.setTimeout(handleScroll, 300)
      }
    }

    window.addEventListener('scroll', handleDebounceScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return {
    loadedData,
    isLoading,
  }
}
