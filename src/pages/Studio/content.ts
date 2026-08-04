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

type Item = { title: string; note: string }

const RECIPES: Record<Lang, Item[]> = {
  en: [
    { title: 'Read a CSV', note: 'pandas · 2 lines' },
    { title: 'Group and total', note: 'pandas · 1 line' },
    { title: 'Bar chart', note: 'matplotlib · 2 lines' },
  ],
  de: [
    { title: 'CSV einlesen', note: 'pandas · 2 Zeilen' },
    { title: 'Gruppieren und summieren', note: 'pandas · 1 Zeile' },
    { title: 'Balkendiagramm', note: 'matplotlib · 2 Zeilen' },
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

const SHARE_OPTS: Record<Lang, Item[]> = {
  en: [
    { title: 'Anyone with the link can run it', note: 'They get their own copy of the runtime' },
    { title: 'Include sales.csv', note: '18 KB uploaded with the snapshot' },
    { title: 'Show my notes', note: 'The margin notes travel with the code' },
  ],
  de: [
    { title: 'Jeder mit dem Link kann es ausführen', note: 'Alle bekommen ihre eigene Laufzeit' },
    { title: 'sales.csv mitschicken', note: '18 KB werden mit dem Schnappschuss geladen' },
    { title: 'Meine Notizen zeigen', note: 'Die Randnotizen reisen mit dem Code' },
  ],
}

export function recipesFor(lang: Lang) {
  return RECIPES[lang]
}
export function startsFor(lang: Lang) {
  return STARTS[lang]
}
export function shareOptsFor(lang: Lang) {
  return SHARE_OPTS[lang]
}
