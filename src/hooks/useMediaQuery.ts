import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void) {
  const mediaQueryList = window.matchMedia(query)
  mediaQueryList.addEventListener('change', callback)
  return () => mediaQueryList.removeEventListener('change', callback)
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches
}

/** Subscribes to a CSS media query and returns whether it currently matches. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => false,
  )
}

/**
 * Named breakpoint helpers mirroring the design tokens in
 * `src/styles/tokens/layout.css` (--ri-breakpoint-tablet / --ri-breakpoint-desktop).
 * CSS custom properties can't be read inside @media conditions, so these
 * pixel values must be kept in sync with that file by hand.
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1279px)')
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
