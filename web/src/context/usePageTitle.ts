import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `Zivara | ${title}`
    return () => { document.title = 'Zivara' }
  }, [title])
}
