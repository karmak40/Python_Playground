export const CODE = [
  'def classify(n):',
  '    if n % 15 == 0:',
  '        return "fizzbuzz"',
  '    if n % 3 == 0:',
  '        return "fizz"',
  '    return str(n)',
  '',
  'for n in range(1, 16):',
  '    print(classify(n))',
]

export type TraceStep = { line: number; scope: [string, string][] }

/** step index -> paused line (1-based) and the local scope at that pause. */
export const TRACE: TraceStep[] = [
  { line: 8, scope: [['n', '—'], ['classify', '<function>']] },
  { line: 9, scope: [['n', '1'], ['classify', '<function>']] },
  { line: 2, scope: [['n', '1'], ['n % 15', '1']] },
  { line: 4, scope: [['n', '1'], ['n % 3', '1']] },
  { line: 6, scope: [['n', '1'], ['result', '"1"']] },
  { line: 9, scope: [['n', '2'], ['out', '"1"']] },
  { line: 2, scope: [['n', '3'], ['n % 15', '3']] },
  { line: 4, scope: [['n', '3'], ['n % 3', '0']] },
  { line: 5, scope: [['n', '3'], ['result', '"fizz"']] },
]

export const INITIAL_BREAKPOINTS = [2, 5]
