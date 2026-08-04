import { describe, expect, it } from 'vitest'
import { buildCsvStarter, CODE_BAD, FIXED_LINE, lineAt, replaceLine, sniffCsvColumns } from './content'

describe('lineAt / replaceLine', () => {
  it('reads a 1-based line back out of the default demo script', () => {
    expect(lineAt(CODE_BAD, 8)).toBe('monthly = df.groupby("month")["Revenue"].sum()')
  })

  it('replaces exactly one line and leaves the rest untouched', () => {
    const fixed = replaceLine(CODE_BAD, 8, FIXED_LINE)
    expect(lineAt(fixed, 8)).toBe(FIXED_LINE)
    expect(lineAt(fixed, 5)).toBe(lineAt(CODE_BAD, 5))
    expect(fixed.split('\n')).toHaveLength(CODE_BAD.split('\n').length)
  })

  it('returns an empty string past the end of the file rather than throwing', () => {
    expect(lineAt(CODE_BAD, 999)).toBe('')
  })
})

describe('sniffCsvColumns', () => {
  it('reads real header names from a real file, trimming quotes and whitespace', async () => {
    const file = new File(['Month, "Revenue", Units\n2025-01,1000,4\n'], 'sales.csv', { type: 'text/csv' })
    await expect(sniffCsvColumns(file)).resolves.toEqual(['Month', 'Revenue', 'Units'])
  })

  it('never invents columns for an empty file', async () => {
    const file = new File([''], 'empty.csv', { type: 'text/csv' })
    await expect(sniffCsvColumns(file)).resolves.toEqual([])
  })
})

describe('buildCsvStarter', () => {
  it('embeds the real filename and real column names, nothing invented', () => {
    const script = buildCsvStarter('orders.csv', ['id', 'total'])
    expect(script).toContain('pd.read_csv("orders.csv")')
    expect(script).toContain('# columns: id, total')
  })

  it('escapes a filename with quotes so the generated script stays valid Python', () => {
    const script = buildCsvStarter('weird"name.csv', [])
    expect(script).toContain('pd.read_csv("weird\\"name.csv")')
  })

  it('omits the columns comment entirely when none were found', () => {
    const script = buildCsvStarter('mystery.csv', [])
    expect(script).not.toContain('# columns:')
  })
})
