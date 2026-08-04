import { useDebuggerDemo } from './useDebuggerDemo'
import { DebuggerDemoCard } from './DebuggerDemoCard'

export function RecordedDemoCard() {
  const recorded = useDebuggerDemo()
  return <DebuggerDemoCard mode="recorded" {...recorded} />
}
