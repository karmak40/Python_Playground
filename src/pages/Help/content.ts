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
  slug: string
  cat: CatId
  time: string
  titleEn: string
  descEn: string
  bodyEn: string[]
  titleDe: string
  descDe: string
  bodyDe: string[]
}

export const ARTICLES: ArticleDef[] = [
  {
    slug: 'run-first-script',
    cat: 'start',
    time: '2 min',
    titleEn: 'Run your first script',
    descEn: 'Nothing to install. Press Run and read the margin.',
    bodyEn: [
      "Open the Playground and you'll see a real script already loaded — a CSV read, a groupby, a chart. Press Run (or ⌘/Ctrl+Enter) and the interpreter — real CPython, compiled to WebAssembly — starts up right there in your browser tab.",
      "Nothing is installed on your machine and nothing leaves your device: the first run downloads Python itself once (a few seconds, cached after that), then every line executes locally.",
    ],
    titleDe: 'Dein erstes Skript ausführen',
    descDe: 'Nichts zu installieren. Auf Ausführen drücken und den Rand lesen.',
    bodyDe: [
      'Öffne den Playground und du siehst ein echtes, bereits geladenes Skript – eine CSV wird gelesen, gruppiert und als Diagramm dargestellt. Drück Ausführen (oder ⌘/Strg+Enter), und der Interpreter – echtes CPython, zu WebAssembly kompiliert – startet direkt in deinem Browser-Tab.',
      'Auf deinem Gerät wird nichts installiert, und nichts verlässt es: Der erste Lauf lädt Python selbst einmal herunter (ein paar Sekunden, danach zwischengespeichert), dann läuft jede Zeile lokal.',
    ],
  },
  {
    slug: 'margin-column',
    cat: 'start',
    time: '3 min',
    titleEn: 'What the margin column shows',
    descEn: 'Every print, return value and figure, beside the line that made it.',
    bodyEn: [
      "Every print(), every bare expression's value, and every matplotlib figure shows up in the column beside the line that produced it — not scrolled away in a console underneath everything else.",
      'A bare df.head() with no print() around it still shows its value: pandas DataFrames render as a real table there, not a wall of repr() text.',
    ],
    titleDe: 'Was die Randspalte zeigt',
    descDe: 'Jedes print, jeden Rückgabewert und jede Abbildung – neben der Zeile, die sie erzeugt hat.',
    bodyDe: [
      'Jedes print(), jeder Wert eines nackten Ausdrucks und jede matplotlib-Abbildung erscheint in der Spalte neben der Zeile, die sie erzeugt hat – nicht in einer Konsole, die irgendwo darunter wegscrollt.',
      'Ein blankes df.head() ohne print() zeigt trotzdem seinen Wert: pandas-DataFrames erscheinen dort als echte Tabelle, nicht als Wand aus repr()-Text.',
    ],
  },
  {
    slug: 'keyboard-shortcuts',
    cat: 'start',
    time: '2 min',
    titleEn: 'Keyboard shortcuts',
    descEn: '⌘/Ctrl+Enter runs. F9 toggles a breakpoint.',
    bodyEn: [
      "⌘/Ctrl+Enter runs the active file. F9 toggles a breakpoint on whatever line your cursor is on — the same shortcut VS Code and Visual Studio use, for anyone who'd rather not reach for the mouse to click the gutter.",
      "That's the full list today. A command palette and a comment-toggle shortcut aren't built yet.",
    ],
    titleDe: 'Tastenkürzel',
    descDe: '⌘/Strg+Enter führt aus. F9 schaltet einen Breakpoint um.',
    bodyDe: [
      '⌘/Strg+Enter führt die geöffnete Datei aus. F9 schaltet einen Breakpoint auf der Zeile um, in der gerade der Cursor steht – dasselbe Kürzel wie in VS Code und Visual Studio, für alle, die dafür nicht extra zur Maus greifen wollen.',
      'Das ist heute die vollständige Liste. Eine Befehlspalette und ein Kürzel zum Kommentieren gibt es noch nicht.',
    ],
  },
  {
    slug: 'upload-file',
    cat: 'files',
    time: '3 min',
    titleEn: 'Upload a CSV, JSON or text file',
    descEn: 'Drag it onto the file list. It stays on your device.',
    bodyEn: [
      "Drag a file onto the sidebar's file list, or use \"+ upload data file\". It's written straight into the same in-browser filesystem your Python code reads from — nothing is sent anywhere.",
      "There's a 50 MB limit per file: the whole thing lives in the tab's memory while you work with it.",
    ],
    titleDe: 'CSV, JSON oder Textdatei hochladen',
    descDe: 'Auf die Dateiliste ziehen. Sie bleibt auf deinem Gerät.',
    bodyDe: [
      'Zieh eine Datei auf die Dateiliste in der Seitenleiste, oder nutze „+ Datendatei hochladen“. Sie wird direkt in dasselbe Dateisystem im Browser geschrieben, aus dem dein Python-Code liest – nichts wird irgendwohin gesendet.',
      'Pro Datei gilt ein Limit von 50 MB: Sie liegt komplett im Arbeitsspeicher des Tabs, solange du damit arbeitest.',
    ],
  },
  {
    slug: 'read-file',
    cat: 'files',
    time: '4 min',
    titleEn: 'Read a file from your code',
    descEn: 'open() and pandas.read_csv() behave exactly as they do locally.',
    bodyEn: [
      "Once uploaded, open(\"yourfile.csv\") and pandas.read_csv(\"yourfile.csv\") work exactly like they would on your own machine — same relative path, same encoding rules.",
      'Uploaded bytes are kept exactly as they arrived, not decoded as text first — so a CSV exported from Excel in Windows-1252 still reads correctly instead of getting corrupted before pandas even sees it.',
    ],
    titleDe: 'Eine Datei aus dem Code lesen',
    descDe: 'open() und pandas.read_csv() verhalten sich genau wie lokal.',
    bodyDe: [
      'Nach dem Hochladen funktionieren open("deinedatei.csv") und pandas.read_csv("deinedatei.csv") genau wie auf deinem eigenen Gerät – derselbe relative Pfad, dieselben Kodierungsregeln.',
      'Hochgeladene Bytes bleiben unverändert, wie sie ankamen, statt vorher als Text dekodiert zu werden – eine aus Excel exportierte CSV in Windows-1252 liest also korrekt, statt schon vor pandas verfälscht zu werden.',
    ],
  },
  {
    slug: 'column-not-found',
    cat: 'files',
    time: '2 min',
    titleEn: 'Why a column name is not found',
    descEn: 'Column names are case-sensitive. The error panel offers the fix.',
    bodyEn: [
      'pandas column names are case-sensitive — Month and month are different columns as far as pandas is concerned. A KeyError here almost always means a typo in case, not a genuinely missing column.',
      "When that happens, the error panel shows the real column names your file actually has, and — where the fix is that obvious — a button that applies it to the exact line that got it wrong.",
    ],
    titleDe: 'Warum ein Spaltenname nicht gefunden wird',
    descDe: 'Spaltennamen sind case-sensitiv. Das Fehlerpanel bietet die Korrektur an.',
    bodyDe: [
      'Spaltennamen in pandas sind case-sensitiv – Month und month sind für pandas zwei verschiedene Spalten. Ein KeyError hier bedeutet fast immer einen Tippfehler bei Gross-/Kleinschreibung, nicht eine wirklich fehlende Spalte.',
      'Dann zeigt das Fehlerpanel die echten Spaltennamen deiner Datei an und – wenn die Korrektur so eindeutig ist – einen Knopf, der sie direkt auf die betroffene Zeile anwendet.',
    ],
  },
  {
    slug: 'install-pypi',
    cat: 'pkgs',
    time: '3 min',
    titleEn: 'Install a package from PyPI',
    descEn: 'Pure-Python wheels install on demand and are cached for next time.',
    bodyEn: [
      'Use "+ install from PyPI" in the sidebar and type a package name. It installs for real, via micropip, straight into the running interpreter — no page reload.',
      "Only pure-Python wheels work: anything with a compiled C extension that isn't built for WebAssembly fails to install, and the installer says so plainly rather than pretending it worked.",
    ],
    titleDe: 'Ein Paket von PyPI installieren',
    descDe: 'Reine Python-Wheels werden bei Bedarf installiert und zwischengespeichert.',
    bodyDe: [
      'Nutz „+ von PyPI installieren“ in der Seitenleiste und tipp einen Paketnamen ein. Es wird über micropip wirklich installiert, direkt in den laufenden Interpreter – kein Neuladen der Seite.',
      'Nur reine Python-Wheels funktionieren: Alles mit kompilierten C-Erweiterungen, die nicht für WebAssembly gebaut sind, lässt sich nicht installieren – und der Installer sagt das klar, statt einen Erfolg vorzutäuschen.',
    ],
  },
  {
    slug: 'builtin-packages',
    cat: 'pkgs',
    time: '2 min',
    titleEn: 'Which libraries are built in',
    descEn: 'pandas, numpy, matplotlib, scipy and scikit-learn — loaded on first import.',
    bodyEn: [
      'pandas, numpy, matplotlib, scipy and scikit-learn are all available and load automatically the moment your code imports them — no install step, no waiting on the sidebar.',
      "plotly imports too, but there's no chart-capture hook for it yet like the one matplotlib gets — a plotly figure won't currently show up in the margin. matplotlib is what actually renders today. Anything else installs on demand from PyPI (see \"Install a package from PyPI\"), as long as it's pure Python.",
    ],
    titleDe: 'Welche Bibliotheken eingebaut sind',
    descDe: 'pandas, numpy, matplotlib, scipy und scikit-learn – laden beim ersten Import.',
    bodyDe: [
      'pandas, numpy, matplotlib, scipy und scikit-learn sind alle verfügbar und laden automatisch, sobald dein Code sie importiert – kein Installationsschritt, kein Warten in der Seitenleiste.',
      'plotly lässt sich zwar importieren, hat aber noch keinen Abbildungs-Hook wie matplotlib – eine plotly-Abbildung erscheint derzeit nicht im Rand. matplotlib ist es, was heute wirklich rendert. Alles andere installiert sich bei Bedarf von PyPI (siehe „Ein Paket von PyPI installieren“), solange es reines Python ist.',
    ],
  },
  {
    slug: 'breakpoints',
    cat: 'debug',
    time: '5 min',
    titleEn: 'Set a breakpoint and step through',
    descEn: 'Click the gutter, then walk the code line by line while State updates.',
    bodyEn: [
      'Click the gutter beside any line, or press F9 with your cursor on it, to set a real breakpoint — a red dot, not a decoration.',
      'Press Debug and the interpreter genuinely pauses there: not a replayed recording, the actual running interpreter blocked mid-line. Step or Continue moves it forward, and the State panel updates with real values at every stop.',
    ],
    titleDe: 'Breakpoint setzen und schrittweise gehen',
    descDe: 'In den Rand klicken und den Code Zeile für Zeile durchgehen, während der Zustand mitgeht.',
    bodyDe: [
      'Klick in den Rand neben eine Zeile, oder drück F9 mit dem Cursor dort, um einen echten Breakpoint zu setzen – ein roter Punkt, keine Dekoration.',
      'Drück Debuggen, und der Interpreter hält dort wirklich an: keine abgespielte Aufzeichnung, sondern der tatsächlich laufende Interpreter, mitten in der Zeile angehalten. Schritt oder Weiter bewegt ihn vorwärts, und das Zustands-Panel zeigt bei jedem Halt echte Werte.',
    ],
  },
  {
    slug: 'state-panel',
    cat: 'debug',
    time: '3 min',
    titleEn: 'Reading the State panel',
    descEn: 'Shapes, dtypes and lengths — without printing anything.',
    bodyEn: [
      "While paused (or after a run finishes), the State panel lists every variable in scope — a DataFrame's shape and column dtypes, a Series' length, a plain number's actual value — without you having to print() any of it.",
      "It's a summary, not a repr() dump: large structures show their shape rather than every element, so it stays readable even for a big DataFrame.",
    ],
    titleDe: 'Das Zustands-Panel lesen',
    descDe: 'Formen, dtypes und Längen – ganz ohne print.',
    bodyDe: [
      'Während der Pause (oder nach einem abgeschlossenen Lauf) listet das Zustands-Panel jede Variable im Geltungsbereich – die Form und Spalten-dtypes eines DataFrames, die Länge einer Series, den echten Wert einer einfachen Zahl – ganz ohne dass du irgendetwas print()en musst.',
      'Es ist eine Zusammenfassung, kein repr()-Dump: Grosse Strukturen zeigen ihre Form statt jedes einzelnen Elements, sodass es auch bei einem grossen DataFrame lesbar bleibt.',
    ],
  },
  {
    slug: 'share-link',
    cat: 'share',
    time: '3 min',
    titleEn: 'Share a playground as a link',
    descEn: 'A snapshot is uploaded. The original keeps living on your machine.',
    bodyEn: [
      "This isn't built yet. There's no cloud backend to host a snapshot of your playground on, so the Share button today just collects an email and lets you know the moment real share links exist — it doesn't generate a working link.",
      'Until then, the most reliable way to hand someone your code is still copy-paste, or a real file.',
    ],
    titleDe: 'Einen Playground als Link teilen',
    descDe: 'Ein Schnappschuss wird hochgeladen. Das Original bleibt auf deinem Gerät.',
    bodyDe: [
      'Das gibt es noch nicht. Es gibt kein Cloud-Backend, auf dem ein Schnappschuss deines Playgrounds liegen könnte – der Share-Button sammelt heute nur eine E-Mail-Adresse und meldet sich, sobald echte Share-Links existieren. Er erzeugt keinen funktionierenden Link.',
      'Bis dahin bleibt Copy-Paste oder eine echte Datei der zuverlässigste Weg, jemandem deinen Code zu geben.',
    ],
  },
  {
    slug: 'export-pdf',
    cat: 'share',
    time: '2 min',
    titleEn: 'Export a run to PDF',
    descEn: 'Not available yet — there is no Pro plan to gate it behind.',
    bodyEn: [
      "Not available yet. There's no Pro plan to gate it behind either, since accounts and billing don't exist yet — this article will explain how PDF export actually works once they do, instead of describing a plan that hasn't launched.",
    ],
    titleDe: 'Einen Lauf als PDF exportieren',
    descDe: 'Noch nicht verfügbar – es gibt noch keinen Pro-Tarif, hinter dem es stecken könnte.',
    bodyDe: [
      'Noch nicht verfügbar. Es gibt auch noch keinen Pro-Tarif, hinter dem es stecken könnte, da es noch keine Konten oder Abrechnung gibt – dieser Artikel erklärt den echten PDF-Export, sobald es so weit ist, statt einen noch nicht gestarteten Tarif zu beschreiben.',
    ],
  },
  {
    slug: 'sync-devices',
    cat: 'acct',
    time: '4 min',
    titleEn: 'Turn on sync across devices',
    descEn: 'What is uploaded, what is not, and how to switch it off again.',
    bodyEn: [
      "There's no account system yet, so there's nothing to sync — everything you do today lives only in this browser's storage, on this one device.",
      'This article will cover the real mechanics — what gets uploaded, what stays local, how to switch it off — once accounts actually exist.',
    ],
    titleDe: 'Geräte-Sync einschalten',
    descDe: 'Was hochgeladen wird, was nicht – und wie du es wieder abschaltest.',
    bodyDe: [
      'Es gibt noch kein Kontosystem, also gibt es auch nichts zu synchronisieren – alles, was du heute tust, liegt nur im Speicher dieses Browsers, auf diesem einen Gerät.',
      'Dieser Artikel beschreibt die echten Mechanismen – was hochgeladen wird, was lokal bleibt, wie man es abschaltet –, sobald es Konten wirklich gibt.',
    ],
  },
  {
    slug: 'billing',
    cat: 'acct',
    time: '3 min',
    titleEn: 'Billing, invoices and cancelling',
    descEn: 'Change plan any time. Your playgrounds stay on your device.',
    bodyEn: [
      "There's no billing yet — the free tier is everything that exists today, and nothing here costs money or asks for a card.",
      'This article is a placeholder for when a real paid plan launches.',
    ],
    titleDe: 'Abrechnung, Rechnungen und Kündigung',
    descDe: 'Tarif jederzeit wechselbar. Deine Playgrounds bleiben auf deinem Gerät.',
    bodyDe: [
      'Es gibt noch keine Abrechnung – der Gratis-Tarif ist alles, was heute existiert, und nichts hier kostet Geld oder verlangt eine Karte.',
      'Dieser Artikel ist ein Platzhalter für den Start eines echten bezahlten Tarifs.',
    ],
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

export type HelpArticle = {
  slug: string
  cat: CatId
  catLabel: string
  time: string
  title: string
  desc: string
  body: string[]
}

export function articleBySlug(slug: string, lang: Lang): HelpArticle | null {
  const a = ARTICLES.find((x) => x.slug === slug)
  if (!a) return null
  return {
    slug: a.slug,
    cat: a.cat,
    catLabel: catLabel(a.cat, lang),
    time: a.time,
    title: lang === 'de' ? a.titleDe : a.titleEn,
    desc: lang === 'de' ? a.descDe : a.descEn,
    body: lang === 'de' ? a.bodyDe : a.bodyEn,
  }
}
