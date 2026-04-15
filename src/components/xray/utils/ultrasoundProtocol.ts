export interface UltrasoundProtocolCopySection {
  key: string
  label: string
  documentHtml: string
  conclusionText: string
}

function parseProtocolDocument(documentHtml: string) {
  if (typeof window === 'undefined') {
    return null
  }

  const parser = new window.DOMParser()
  const documentNode = parser.parseFromString(documentHtml, 'text/html')
  const rootNode = documentNode.body?.querySelector('.export-shell') ?? documentNode.body

  if (!rootNode) {
    return null
  }

  return {
    documentNode,
    rootNode: rootNode as HTMLElement,
  }
}

function normalizeInlineText(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeClipboardText(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/:([^\s\n])/g, ': $1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getStableProtocolKey(title: string) {
  const loweredTitle = title.toLocaleLowerCase('ru-RU')
  const isOmtFemale =
    /\(\s*ж\s*\)/.test(loweredTitle) ||
    loweredTitle.includes('\u0436\u0435\u043d')
  const isOmtMale =
    /\(\s*м\s*\)/.test(loweredTitle) ||
    loweredTitle.includes('\u043c\u0443\u0436')
  const isAbdominal =
    loweredTitle.includes('\u043e\u0431\u043f') ||
    loweredTitle.includes('\u0431\u0440\u044e\u0448') ||
    loweredTitle.includes('abdomen')
  const isKidneys =
    loweredTitle.includes('\u043f\u043e\u0447\u043a\u0438') ||
    loweredTitle.includes('\u043f\u043e\u0447\u0435\u043a') ||
    loweredTitle.includes('kidney')

  if (isAbdominal) return 'obp'
  if (isKidneys) return 'kidneys'
  if (loweredTitle.includes('\u0449\u0438\u0442\u043e\u0432\u0438\u0434')) return 'thyroid'
  if (loweredTitle.includes('\u043c\u043e\u043b\u043e\u0447\u043d')) return 'breast'
  if (loweredTitle.includes('\u043c\u043e\u0448\u043e\u043d')) return 'scrotum'
  if (loweredTitle.includes('\u043c\u043e\u0447\u0435\u0432\u043e\u0439 \u043f\u0443\u0437\u044b\u0440')) return 'bladder'
  if (loweredTitle.includes('\u043b\u0438\u043c\u0444')) return 'lymph-nodes'
  if (loweredTitle.includes('\u0441\u043b\u044e\u043d')) return 'salivary-glands'
  if (loweredTitle.includes('\u0431\u0446\u0430')) return 'brachio-cephalic-arteries'
  if (loweredTitle.includes('\u043c\u044f\u0433\u043a')) return 'soft-tissue'
  if (loweredTitle.includes('\u0434\u0438\u0441\u043f\u0430\u043d\u0441\u0435\u0440')) return 'child-dispensary'
  if (loweredTitle.includes('\u043c\u0430\u043b\u043e\u0433\u043e \u0442\u0430\u0437\u0430')) {
    if (isOmtFemale) return 'omt-female'
    if (isOmtMale) return 'omt-male'
  }
  if (loweredTitle.includes('\u043e\u043c\u0442') && isOmtFemale) return 'omt-female'
  if (loweredTitle.includes('\u043e\u043c\u0442') && isOmtMale) return 'omt-male'

  return loweredTitle || 'protocol'
}

function getProtocolConclusionMap(rootNode: HTMLElement) {
  const conclusionMap = new Map<string, string[]>()

  Array.from(rootNode.querySelectorAll<HTMLElement>('[data-uzi-conclusion-key]')).forEach((node) => {
    const key = normalizeInlineText(node.dataset.uziConclusionKey ?? '')
    const conclusion = normalizeClipboardText(node.dataset.uziConclusion ?? '')

    if (!key || !conclusion) {
      return
    }

    const existing = conclusionMap.get(key)
    if (existing) {
      existing.push(conclusion)
      return
    }

    conclusionMap.set(key, [conclusion])
  })

  return conclusionMap
}

function getMergedConclusionText(conclusionMap: Map<string, string[]>, key: string) {
  const sourceKeys = key === 'obp-kidneys' ? ['obp', 'kidneys'] : [key]
  const values = sourceKeys.flatMap((sourceKey) => conclusionMap.get(sourceKey) ?? [])
  const normalizedValues = values.map((value) => normalizeClipboardText(value)).filter(Boolean)
  return Array.from(new Set(normalizedValues)).join('\n')
}

function formatSpecialProtocolBlocks(value: string) {
  let text = value

  const thyroidMarkers = ['Правая доля:', 'Левая доля:', 'Перешеек ']
  const lymphMarkers = [
    'Поднижнечелюстные:',
    'Шейные:',
    'Подключичные:',
    'Надключичные:',
    'Подмышечные:',
    'Паховые:',
    'Справа определяется',
    'Слева определяется',
  ]

  for (const marker of [...thyroidMarkers, ...lymphMarkers]) {
    const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    text = text.replace(new RegExp(`([^\\n])(${escapedMarker})`, 'g'), '$1\n\n$2')
  }

  text = text
    .replace(/([^\n])(\n\nУзел №\d+)/g, '$1\n$2')
    .replace(/(\n\nСправа определяется)/g, '\n$1')
    .replace(/(\n\nСлева определяется)/g, '\n$1')
    .replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

function getProtocolFragmentDocumentHtml(
  documentNode: Document,
  rootNode: HTMLElement,
  fragmentHtml: string,
) {
  const headHtml = documentNode.head?.innerHTML ?? ''
  const rootClassName = rootNode.className ? ` class="${rootNode.className}"` : ''

  return `<!doctype html>
<html lang="ru">
  <head>
${headHtml}
  </head>
  <body>
    <div${rootClassName}>${fragmentHtml}</div>
  </body>
</html>`
}

function getProtocolCopyGroup(title: string) {
  const normalizedTitle = normalizeInlineText(title)
  const stableKey = getStableProtocolKey(normalizedTitle)
  const isAbdominal = stableKey === 'obp'
  const isKidneys = stableKey === 'kidneys'

  if (isAbdominal && isKidneys) {
    return {
      key: 'obp-kidneys',
      label: '\u041e\u0411\u041f + \u041f\u043e\u0447\u043a\u0438',
    }
  }

  if (isAbdominal) {
    return {
      key: 'obp',
      label: '\u041e\u0411\u041f',
    }
  }

  if (isKidneys) {
    return {
      key: 'kidneys',
      label: '\u041f\u043e\u0447\u043a\u0438',
    }
  }

  return {
    key: stableKey,
    label: normalizedTitle || '\u041f\u0440\u043e\u0442\u043e\u043a\u043e\u043b',
  }
}

function mergeObpAndKidneysSections<
  T extends {
    key: string
    label: string
    order: number
    fragments: string[]
  },
>(groupedSections: Map<string, T>) {
  const obpSection = groupedSections.get('obp')
  const kidneysSection = groupedSections.get('kidneys')

  if (!obpSection || !kidneysSection) {
    return groupedSections
  }

  const mergedSections = new Map(groupedSections)
  mergedSections.delete('obp')
  mergedSections.delete('kidneys')
  mergedSections.set('obp-kidneys', {
    ...obpSection,
    key: 'obp-kidneys',
    label: '\u041e\u0411\u041f + \u041f\u043e\u0447\u043a\u0438',
    order: Math.min(obpSection.order, kidneysSection.order),
    fragments:
      obpSection.order <= kidneysSection.order
        ? [...obpSection.fragments, ...kidneysSection.fragments]
        : [...kidneysSection.fragments, ...obpSection.fragments],
  })

  return mergedSections
}

export function getProtocolViewerHtml(documentHtml: string) {
  const overrideCss = `
    <style>
      html, body {
        background: #f1f5f9 !important;
      }

      .export-shell {
        background: transparent !important;
      }
    </style>
  `

  if (documentHtml.includes('</head>')) {
    return documentHtml.replace('</head>', `${overrideCss}</head>`)
  }

  return `${overrideCss}${documentHtml}`
}

export function getProtocolClipboardPayload(
  documentHtml: string,
  options?: {
    conclusionText?: string
  },
) {
  const parsedProtocol = parseProtocolDocument(documentHtml)

  if (!parsedProtocol) {
    return { text: '', html: '' }
  }

  const { documentNode, rootNode } = parsedProtocol
  const initialHtml = documentNode.body?.innerHTML ?? ''
  const blockTags = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'div',
    'dl',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'li',
    'main',
    'nav',
    'ol',
    'p',
    'pre',
    'section',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul',
  ])

  function serializeNode(node: Node, listDepth = 0): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return normalizeInlineText(node.textContent ?? '')
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()

    if (['script', 'style', 'noscript'].includes(tagName)) {
      return ''
    }

    if (tagName === 'br') {
      return '\n'
    }

    if (tagName === 'li') {
      const itemText = Array.from(element.childNodes)
        .map((childNode) => serializeNode(childNode, listDepth + 1))
        .join('')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      if (!itemText) {
        return ''
      }

      const indent = '  '.repeat(Math.max(0, listDepth))
      const normalizedItemText = itemText.replace(/\n/g, `\n${indent}  `)
      return `${indent}• ${normalizedItemText}\n`
    }

    if (tagName === 'tr') {
      const rowText = Array.from(element.children)
        .map((childElement) => serializeNode(childElement, listDepth).trim())
        .filter(Boolean)
        .join(' | ')

      return rowText ? `${rowText}\n` : ''
    }

    const childText = Array.from(element.childNodes)
      .map((childNode) => serializeNode(childNode, listDepth))
      .join('')

    if (blockTags.has(tagName)) {
      const normalizedBlockText = childText
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      return normalizedBlockText ? `${normalizedBlockText}\n\n` : ''
    }

    return childText
  }

  const text = formatSpecialProtocolBlocks(normalizeClipboardText(serializeNode(rootNode)))
  const conclusionText = normalizeClipboardText(options?.conclusionText ?? '')
  const fullText = conclusionText ? `${text}\n\nЗаключение: ${conclusionText}` : text
  const htmlConclusion = conclusionText
    ? `<p><strong>Заключение:</strong> ${escapeHtml(conclusionText).replace(/\n/g, '<br>')}</p>`
    : ''
  const html = `${initialHtml}${htmlConclusion}`

  return { text: fullText, html }
}

export function getProtocolCopySections(documentHtml: string) {
  const parsedProtocol = parseProtocolDocument(documentHtml)

  if (!parsedProtocol) {
    return []
  }

  const { documentNode, rootNode } = parsedProtocol
  const conclusionMap = getProtocolConclusionMap(rootNode)
  const printableBlocks = Array.from(rootNode.querySelectorAll<HTMLElement>('.print-page-inner > .no-break'))

  if (printableBlocks.length > 0) {
    const headerBlock = printableBlocks[0] ?? null
    const groupedSections = new Map<
      string,
      {
        label: string
        order: number
        fragments: string[]
      }
    >()

    printableBlocks.forEach((blockNode, index) => {
      if (index === 0) {
        return
      }

      const titleNode = blockNode.querySelector<HTMLElement>('p[class*="font-semibold"]')

      if (!titleNode) {
        return
      }

      const group = getProtocolCopyGroup(titleNode.textContent ?? '')
      const existingGroup = groupedSections.get(group.key)

      if (existingGroup) {
        existingGroup.fragments.push(blockNode.outerHTML)
        return
      }

      groupedSections.set(group.key, {
        label: group.label,
        order: index,
        fragments: [blockNode.outerHTML],
      })
    })

    const mergedSections = mergeObpAndKidneysSections(groupedSections)

    if (mergedSections.size > 0) {
      const pageStartHtml = `<div class="print-page"><div class="print-page-inner">`
      const pageEndHtml = `</div></div>`

      return Array.from(mergedSections.entries())
        .sort((left, right) => left[1].order - right[1].order)
        .map(([key, section]) => ({
          key,
          label: section.label,
          conclusionText: getMergedConclusionText(conclusionMap, key),
          documentHtml: getProtocolFragmentDocumentHtml(
            documentNode,
            rootNode,
            `${pageStartHtml}${section.fragments.join('')}${pageEndHtml}`,
          ),
        }))
    }
  }

  const titleNodes = Array.from(rootNode.querySelectorAll<HTMLElement>('p[class*="font-semibold"]')).filter(
    (titleNode) => normalizeInlineText(titleNode.textContent ?? '').length > 0,
  )

  if (titleNodes.length === 0) {
    return [
      {
        key: 'protocol',
        label: 'Протокол',
        documentHtml,
        conclusionText: '',
      },
    ]
  }

  const firstTitleNode = titleNodes[0]
  const sectionsParent = firstTitleNode?.parentElement

  if (!sectionsParent) {
    return [
      {
        key: 'protocol',
        label: 'Протокол',
        documentHtml,
        conclusionText: '',
      },
    ]
  }

  const parentChildren = Array.from(sectionsParent.children) as HTMLElement[]
  const titleIndices = titleNodes
    .map((titleNode) => parentChildren.indexOf(titleNode))
    .filter((index) => index >= 0)

  if (titleIndices.length === 0) {
    return [
      {
        key: 'protocol',
        label: 'Протокол',
        documentHtml,
        conclusionText: '',
      },
    ]
  }

  const groupedSections = new Map<
    string,
    {
      label: string
      order: number
      fragments: string[]
    }
  >()

  const firstTitleIndex = titleIndices[0] ?? 0
  const conclusionStartIndex = parentChildren.findIndex((childNode, index) => {
    const normalizedText = normalizeInlineText(childNode.textContent ?? '').toLocaleLowerCase('ru-RU')
    return (
      index >= firstTitleIndex &&
      (normalizedText.startsWith('заключение:') || normalizedText.startsWith('рекомендации:'))
    )
  })

  titleIndices.forEach((titleIndex, index) => {
    const titleNode = parentChildren[titleIndex]
    const nextTitleIndex = titleIndices[index + 1] ?? parentChildren.length
    const sectionEndIndex =
      conclusionStartIndex >= 0 ? Math.min(nextTitleIndex, conclusionStartIndex) : nextTitleIndex
    const sectionHtml = parentChildren
      .slice(titleIndex, sectionEndIndex)
      .map((childNode) => childNode.outerHTML)
      .join('')

    if (!sectionHtml) {
      return
    }

    const group = getProtocolCopyGroup(titleNode.textContent ?? '')
    const existingGroup = groupedSections.get(group.key)

    if (existingGroup) {
      existingGroup.fragments.push(sectionHtml)
      return
    }

    groupedSections.set(group.key, {
      label: group.label,
      order: index,
      fragments: [sectionHtml],
    })
  })

  const mergedSections = mergeObpAndKidneysSections(groupedSections)

  if (mergedSections.size === 0) {
    return [
      {
        key: 'protocol',
        label: 'Протокол',
        documentHtml,
        conclusionText: '',
      },
    ]
  }

  const metadataHtml = Array.from(rootNode.children)
    .filter((childNode) => childNode !== sectionsParent)
    .map((childNode) => (childNode as HTMLElement).outerHTML)
    .join('')

  const sectionHeaderHtml =
    firstTitleIndex > 0
      ? parentChildren.slice(0, firstTitleIndex).map((childNode) => childNode.outerHTML).join('')
      : ''

  return Array.from(mergedSections.entries())
    .sort((left, right) => left[1].order - right[1].order)
    .map(([key, section]) => ({
      key,
      label: section.label,
      conclusionText: getMergedConclusionText(conclusionMap, key),
      documentHtml: getProtocolFragmentDocumentHtml(
        documentNode,
        rootNode,
        `${metadataHtml}${sectionHeaderHtml}${section.fragments.join('')}`,
      ),
    }))
}

export async function writeProtocolToClipboard(
  documentHtml: string,
  options?: {
    conclusionText?: string
  },
) {
  const payload = getProtocolClipboardPayload(documentHtml, options)

  if (!payload.text) {
    return false
  }

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([payload.text], { type: 'text/plain' }),
      'text/html': new Blob([payload.html], { type: 'text/html' }),
    })

    await navigator.clipboard.write([clipboardItem])
    return true
  }

  await navigator.clipboard.writeText(payload.text)
  return true
}


