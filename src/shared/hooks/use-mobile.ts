import * as React from 'react'

// Igual ao breakpoint md, que o sidebar.tsx usa para alternar entre gaveta e coluna.
const MOBILE_QUERY = '(max-width: 767px)'

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}
