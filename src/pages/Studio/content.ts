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
]

export const FIXED_LINE = 'monthly = df.groupby("Month")["Revenue"].sum()'

export type Out = { kind: 'val' | 'block' | 'chip'; text: string }

/** 1-based line number -> simulated stdout, once revealed by the run animation. */
export const OUTS: Record<number, Out> = {
  6: { kind: 'val', text: '(248, 4)' },
  9: {
    kind: 'block',
    text: 'Month\nJan   128,400\nFeb   131,900\nMar   142,050\nApr   138,700\nMay   151,300',
  },
  12: { kind: 'val', text: 'avg growth: 4.8%' },
  15: { kind: 'chip', text: '→ Figure 1' },
}

export type Variable = { name: string; type: string; val: string }

export const VARS: Variable[] = [
  { name: 'df', type: 'DataFrame', val: '248 rows × 4 columns' },
  { name: 'monthly', type: 'Series', val: '12 values · 1.72M total' },
  { name: 'growth', type: 'float', val: '0.0483' },
]

export const BAR_VALUES = [
  128400, 131900, 142050, 138700, 151300, 147800, 139200, 144600, 158900, 163400, 171200, 184700,
]
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const PACKAGES = [
  { name: 'pandas', ver: '2.2.2' },
  { name: 'matplotlib', ver: '3.8.4' },
  { name: 'numpy', ver: '1.26.4' },
]

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
