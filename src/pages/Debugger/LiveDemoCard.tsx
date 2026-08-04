import { useLiveDebugger } from './useLiveDebugger'
import { DebuggerDemoCard } from './DebuggerDemoCard'

export function LiveDemoCard() {
  const live = useLiveDebugger()
  return <DebuggerDemoCard mode="live" {...live} />
}
