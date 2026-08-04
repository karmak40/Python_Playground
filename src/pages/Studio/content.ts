import type { Lang } from '../../i18n/strings'

export const CODE_BAD = [
  'import pandas as pd',
  'import matplotlib.pyplot as plt',
  '',
  '# 248 rows exported from the till system',
  'df = pd.read_csv("sales.csv")',
  'print(df.shape)',
  '',
  'monthly = df.groupby("month")["Revenue"].sum()',
  'print(monthly.head())',
  '',
  'growth = monthly.pct_change().mean()',
  'print(f"avg growth: {growth:.1%}")',
  '',
  'monthly.plot(kind="bar", color="#b0532f")',
  'plt.show()',
].join('\n')

export const FIXED_LINE = 'monthly = df.groupby("Month")["Revenue"].sum()'

/** 1-based line access/replacement over a plain multi-line code string. */
export function lineAt(code: string, line: number): string {
  return code.split('\n')[line - 1] ?? ''
}
export function replaceLine(code: string, line: number, text: string): string {
  const lines = code.split('\n')
  lines[line - 1] = text
  return lines.join('\n')
}

/** Reads just enough of a real uploaded file to list its actual header
 * columns — a naive split (doesn't handle a quoted comma inside a header
 * name), but real column names read from the real file, not a guess. */
export async function sniffCsvColumns(file: File): Promise<string[]> {
  const head = await file.slice(0, 8192).text()
  const firstLine = head.split(/\r\n|\r|\n/)[0] ?? ''
  return firstLine
    .split(',')
    .map((c) => c.trim().replace(/^"|"$/g, ''))
    .filter(Boolean)
}

/** The starter script for the welcome modal's "Drop in a CSV" option — real
 * filename, real columns, nothing invented about what's in the file. */
export function buildCsvStarter(filename: string, columns: string[]): string {
  const safeName = filename.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const columnsLine = columns.length > 0 ? `# columns: ${columns.join(', ')}\n` : ''
  return `import pandas as pd\n\n${columnsLine}df = pd.read_csv("${safeName}")\nprint(df.shape)\ndf.head()\n`
}

type Item = { title: string; note: string }
type Recipe = Item & { code: string }

const RECIPES: Record<Lang, Recipe[]> = {
  en: [
    {
      title: 'Read a CSV',
      note: 'pandas · 2 lines',
      code: 'df = pd.read_csv("sales.csv")\nprint(df.head())',
    },
    {
      title: 'Group and total',
      note: 'pandas · 1 line',
      code: 'totals = df.groupby("month")["Revenue"].sum()',
    },
    {
      title: 'Bar chart',
      note: 'matplotlib · 2 lines',
      code: 'totals.plot(kind="bar")\nplt.show()',
    },
  ],
  de: [
    {
      title: 'CSV einlesen',
      note: 'pandas · 2 Zeilen',
      code: 'df = pd.read_csv("sales.csv")\nprint(df.head())',
    },
    {
      title: 'Gruppieren und summieren',
      note: 'pandas · 1 Zeile',
      code: 'totals = df.groupby("month")["Revenue"].sum()',
    },
    {
      title: 'Balkendiagramm',
      note: 'matplotlib · 2 Zeilen',
      code: 'totals.plot(kind="bar")\nplt.show()',
    },
  ],
}

type Start = Item & { tag: string }

const STARTS: Record<Lang, Start[]> = {
  en: [
    { title: 'Open the sales example', note: 'A CSV, a groupby and a chart — 15 lines', tag: 'suggested' },
    { title: 'Blank file', note: 'Just a cursor and a runtime', tag: '' },
    { title: 'Drop in a CSV', note: 'We read the columns and write the first lines for you', tag: '' },
  ],
  de: [
    { title: 'Umsatz-Beispiel öffnen', note: 'Eine CSV, ein groupby und ein Diagramm — 15 Zeilen', tag: 'empfohlen' },
    { title: 'Leere Datei', note: 'Nur ein Cursor und eine Laufzeit', tag: '' },
    { title: 'CSV hineinziehen', note: 'Wir lesen die Spalten und schreiben die ersten Zeilen für dich', tag: '' },
  ],
}

export function recipesFor(lang: Lang) {
  return RECIPES[lang]
}
export function startsFor(lang: Lang) {
  return STARTS[lang]
}
