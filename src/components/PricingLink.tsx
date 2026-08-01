import { useEffect } from 'react'
import { Link, useLocation, useNavigate, type To } from 'react-router-dom'
import type { ReactNode } from 'react'

const SCROLL_TARGET = 'pricing'

/** Navigates to the Playground page's pricing section from anywhere in the
 * app. Under HashRouter a plain `href="/#pricing"` can't scroll to an
 * element (the fragment becomes part of the route hash), so same-page
 * clicks scroll directly and cross-page clicks pass the target via router
 * state and scroll once the Playground page has mounted. */
export function PricingLink({ className, children }: { className?: string; children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      document.getElementById(SCROLL_TARGET)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: SCROLL_TARGET } })
    }
  }

  return (
    <Link to={'/' as To} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

/** Call once from the Playground page: scrolls to a section named by
 * router state (see PricingLink) after the page it lives on has mounted. */
export function useScrollToStateTarget() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (!target) return
    const el = document.getElementById(target)
    el?.scrollIntoView({ behavior: 'smooth' })
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])
}
