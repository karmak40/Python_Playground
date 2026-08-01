import type { ReactNode } from 'react'

const TOKEN_RE =
  /(#.*$)|(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|(\s+)|([^\sA-Za-z0-9_"'#])/g

export type HighlightOptions = {
  keywords: RegExp
  builtins: RegExp
  /** CSS var for a builtin identifier not followed by "(", e.g. print used as a name. */
  builtinColor: string
  /** CSS var for any identifier immediately followed by "(", i.e. a function call. */
  callColor: string
}

/** Tokenizes one line of Python-ish source into coloured spans, matching the
 * design's inline `hl()` highlighter. Comments render italic. */
export function highlightPython(src: string, key: string, opts: HighlightOptions): ReactNode {
  const re = new RegExp(TOKEN_RE)
  const parts: ReactNode[] = []
  let match: RegExpExecArray | null
  let i = 0

  while ((match = re.exec(src)) !== null) {
    const [full, comment, str, ident, num, , punct] = match
    let color: string | null = null
    let italic = false

    if (comment) {
      color = 'var(--com)'
      italic = true
    } else if (str) {
      color = 'var(--str)'
    } else if (ident) {
      if (opts.keywords.test(ident)) color = 'var(--kw)'
      else if (opts.builtins.test(ident)) color = opts.builtinColor
      else if (src[re.lastIndex] === '(') color = opts.callColor
    } else if (num) {
      color = 'var(--num)'
    } else if (punct) {
      color = 'var(--muted)'
    }

    parts.push(
      <span key={`${key}-${i++}`} style={{ color: color ?? 'inherit', fontStyle: italic ? 'italic' : 'normal' }}>
        {full}
      </span>,
    )
  }

  return parts.length ? parts : ' '
}

export const STUDIO_OPTS: HighlightOptions = {
  keywords:
    /^(import|from|as|def|return|if|else|elif|for|in|while|with|try|except|class|not|and|or|None|True|False|lambda|pass|break|continue)$/,
  builtins: /^(print|len|range|sum|open|int|float|str|list|dict|set|type|enumerate|zip)$/,
  builtinColor: 'var(--bi)',
  callColor: 'var(--fn)',
}

export const DEBUGGER_OPTS: HighlightOptions = {
  keywords: /^(def|return|if|else|elif|for|in|while|import|from|as|not|and|or|None|True|False)$/,
  builtins: /^(print|range|len|str|int)$/,
  builtinColor: 'var(--accent)',
  callColor: 'var(--gold)',
}
