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

export const CODE_SOURCE = CODE.join('\n')

export const INITIAL_BREAKPOINTS = [2, 5]
