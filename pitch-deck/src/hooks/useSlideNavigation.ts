import { useCallback, useEffect, useReducer, useRef } from 'react'

interface State {
  current: number
  direction: number
  total: number
}

type Action =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; index: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NEXT':
      if (state.current >= state.total - 1) return state
      return { ...state, current: state.current + 1, direction: 1 }
    case 'PREV':
      if (state.current <= 0) return state
      return { ...state, current: state.current - 1, direction: -1 }
    case 'GOTO': {
      const idx = Math.max(0, Math.min(action.index, state.total - 1))
      if (idx === state.current) return state
      return { ...state, current: idx, direction: idx > state.current ? 1 : -1 }
    }
  }
}

export function useSlideNavigation(totalSlides: number) {
  const [state, dispatch] = useReducer(reducer, {
    current: 0,
    direction: 0,
    total: totalSlides,
  })

  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goNext = useCallback(() => dispatch({ type: 'NEXT' }), [])
  const goPrev = useCallback(() => dispatch({ type: 'PREV' }), [])
  const goTo = useCallback((i: number) => dispatch({ type: 'GOTO', index: i }), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) touchStart.current = { x: t.clientX, y: t.clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - touchStart.current.x
      if (Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev()
      }
      touchStart.current = null
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (wheelTimeout.current) return
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null
      }, 400)
      if (e.deltaY > 0 || e.deltaX > 0) goNext()
      else if (e.deltaY < 0 || e.deltaX < 0) goPrev()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('wheel', onWheel)
    }
  }, [goNext, goPrev])

  return { current: state.current, direction: state.direction, goNext, goPrev, goTo, total: totalSlides }
}
