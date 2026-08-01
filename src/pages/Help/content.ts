import type { Lang } from '../../i18n/strings'

export type CatId = 'start' | 'files' | 'pkgs' | 'debug' | 'share' | 'acct'

type CatDef = { id: CatId; en: [string, string]; de: [string, string] }

export const CATS: CatDef[] = [
  {
    id: 'start',
    en: ['Getting started', 'Your first run, and what the margin is showing you'],
    de: ['Erste Schritte', 'Der erste Lauf – und was der Rand dir zeigt'],
  },
  {
    id: 'files',
    en: ['Files and data', 'Uploading a CSV and reading it from your code'],
    de: ['Dateien und Daten', 'Eine CSV hochladen und aus dem Code lesen'],
  },
  {
    id: 'pkgs',
    en: ['Packages', 'What ships built in, and what you can install'],
    de: ['Pakete', 'Was eingebaut ist und was du installieren kannst'],
  },
  {
    id: 'debug',
    en: ['Debugging', 'Breakpoints, stepping, and reading the State panel'],
    de: ['Debugging', 'Breakpoints, Einzelschritte und das Zustands-Panel'],
  },
  {
    id: 'share',
    en: ['Sharing and export', 'Links, PDF export, and what actually gets uploaded'],
    de: ['Teilen und Export', 'Links, PDF-Export – und was wirklich hochgeladen wird'],
  },
  {
    id: 'acct',
    en: ['Account and billing', 'Sync, plans, invoices, and how to leave'],
    de: ['Konto und Abrechnung', 'Sync, Tarife, Rechnungen und wie du gehst'],
  },
]

type ArticleDef = {
  cat: CatId
  time: string
  titleEn: string
  descEn: string
  titleDe: string
  descDe: string
}

export const ARTICLES: ArticleDef[] = [
  {
    cat: 'start',
    time: '2 min',
    titleEn: 'Run your first script',
    descEn: 'Nothing to install. Press Run and read the margin.',
    titleDe: 'Dein erstes Skript ausführen',
    descDe: 'Nichts zu installieren. Auf Ausführen drücken und den Rand lesen.',
  },
  {
    cat: 'start',
    time: '3 min',
    titleEn: 'What the margin column shows',
    descEn: 'Every print, return value and figure, beside the line that made it.',
    titleDe: 'Was die Randspalte zeigt',
    descDe: 'Jedes print, jeden Rückgabewert und jede Abbildung – neben der Zeile, die sie erzeugt hat.',
  },
  {
    cat: 'start',
    time: '2 min',
    titleEn: 'Keyboard shortcuts',
    descEn: '⌘↵ runs, ⌘/ comments, ⌘K opens the command bar.',
    titleDe: 'Tastenkürzel',
    descDe: '⌘↵ führt aus, ⌘/ kommentiert, ⌘K öffnet die Befehlsleiste.',
  },
  {
    cat: 'files',
    time: '3 min',
    titleEn: 'Upload a CSV, JSON or text file',
    descEn: 'Drag it onto the file list. It stays on your device.',
    titleDe: 'CSV, JSON oder Textdatei hochladen',
    descDe: 'Auf die Dateiliste ziehen. Sie bleibt auf deinem Gerät.',
  },
  {
    cat: 'files',
    time: '4 min',
    titleEn: 'Read a file from your code',
    descEn: 'open() and pandas.read_csv() behave exactly as they do locally.',
    titleDe: 'Eine Datei aus dem Code lesen',
    descDe: 'open() und pandas.read_csv() verhalten sich genau wie lokal.',
  },
  {
    cat: 'files',
    time: '2 min',
    titleEn: 'Why a column name is not found',
    descEn: 'Column names are case-sensitive. The error panel offers the fix.',
    titleDe: 'Warum ein Spaltenname nicht gefunden wird',
    descDe: 'Spaltennamen sind case-sensitiv. Das Fehlerpanel bietet die Korrektur an.',
  },
  {
    cat: 'pkgs',
    time: '3 min',
    titleEn: 'Install a package from PyPI',
    descEn: 'Pure-Python wheels install on demand and are cached for next time.',
    titleDe: 'Ein Paket von PyPI installieren',
    descDe: 'Reine Python-Wheels werden bei Bedarf installiert und zwischengespeichert.',
  },
  {
    cat: 'pkgs',
    time: '2 min',
    titleEn: 'Which libraries are built in',
    descEn: 'pandas, numpy, matplotlib, plotly, scipy, scikit-learn, requests.',
    titleDe: 'Welche Bibliotheken eingebaut sind',
    descDe: 'pandas, numpy, matplotlib, plotly, scipy, scikit-learn, requests.',
  },
  {
    cat: 'debug',
    time: '5 min',
    titleEn: 'Set a breakpoint and step through',
    descEn: 'Click the gutter, then walk the code line by line while State updates.',
    titleDe: 'Breakpoint setzen und schrittweise gehen',
    descDe: 'In den Rand klicken und den Code Zeile für Zeile durchgehen.',
  },
  {
    cat: 'debug',
    time: '3 min',
    titleEn: 'Reading the State panel',
    descEn: 'Shapes, dtypes and lengths — without printing anything.',
    titleDe: 'Das Zustands-Panel lesen',
    descDe: 'Formen, dtypes und Längen – ganz ohne print.',
  },
  {
    cat: 'share',
    time: '3 min',
    titleEn: 'Share a playground as a link',
    descEn: 'A snapshot is uploaded. The original keeps living on your machine.',
    titleDe: 'Ein Playground als Link teilen',
    descDe: 'Ein Schnappschuss wird hochgeladen. Das Original bleibt auf deinem Gerät.',
  },
  {
    cat: 'share',
    time: '2 min',
    titleEn: 'Export a run to PDF',
    descEn: 'Code, margin results and figures on one page. Pro plans only.',
    titleDe: 'Einen Lauf als PDF exportieren',
    descDe: 'Code, Rand-Ergebnisse und Abbildungen auf einer Seite. Nur mit Pro.',
  },
  {
    cat: 'acct',
    time: '4 min',
    titleEn: 'Turn on sync across devices',
    descEn: 'What is uploaded, what is not, and how to switch it off again.',
    titleDe: 'Geräte-Sync einschalten',
    descDe: 'Was hochgeladen wird, was nicht – und wie du es wieder abschaltest.',
  },
  {
    cat: 'acct',
    time: '3 min',
    titleEn: 'Billing, invoices and cancelling',
    descEn: 'Change plan any time. Your playgrounds stay on your device.',
    titleDe: 'Abrechnung, Rechnungen und Kündigung',
    descDe: 'Tarif jederzeit wechselbar. Deine Playgrounds bleiben auf deinem Gerät.',
  },
]

export const CHIPS: Record<Lang, string[]> = {
  en: ['upload a CSV', 'breakpoint', 'install pandas', 'share a link'],
  de: ['CSV hochladen', 'Breakpoint', 'pandas installieren', 'Link teilen'],
}

export function catLabel(id: CatId, lang: Lang): string {
  const c = CATS.find((x) => x.id === id)
  if (!c) return ''
  return lang === 'de' ? c.de[0] : c.en[0]
}
