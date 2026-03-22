export interface ParanasalSinusState {
  mucosa: '' | 'не изменена' | 'утолщена'
  fluid: '' | 'не определяется' | 'экссудат'
  pneumatization: '' | 'не изменена' | 'снижена'
  contour: '' | 'четкий' | 'нечеткий'
  development?: '' | 'недоразвита' | 'не развита'
  cyst?: '' | 'определяется'
}

export interface ParanasalSinusesSelectionState {
  rightFrontal: ParanasalSinusState
  leftFrontal: ParanasalSinusState
  rightMaxillary: ParanasalSinusState
  leftMaxillary: ParanasalSinusState
}

export function createInitialParanasalSinusesState(): ParanasalSinusesSelectionState {
  return {
    rightFrontal: {
      mucosa: '',
      fluid: '',
      pneumatization: '',
      contour: '',
      development: '',
    },
    leftFrontal: {
      mucosa: '',
      fluid: '',
      pneumatization: '',
      contour: '',
      development: '',
    },
    rightMaxillary: {
      mucosa: '',
      fluid: '',
      pneumatization: '',
      contour: '',
      cyst: '',
    },
    leftMaxillary: {
      mucosa: '',
      fluid: '',
      pneumatization: '',
      contour: '',
      cyst: '',
    },
  }
}

function normalizeFrontal(values: ParanasalSinusState) {
  return {
    mucosa: values.mucosa || 'не изменена',
    fluid: values.fluid || 'не определяется',
    pneumatization: values.pneumatization || 'не изменена',
    contour: values.contour || 'четкий',
    development: values.development || '',
  }
}

function normalizeMaxillary(values: ParanasalSinusState) {
  return {
    mucosa: values.mucosa || 'не изменена',
    fluid: values.fluid || 'не определяется',
    pneumatization: values.pneumatization || 'не изменена',
    contour: values.contour || 'четкий',
    cyst: values.cyst || '',
  }
}

export function generateParanasalSinusesDescription(state: ParanasalSinusesSelectionState) {
  const texts: string[] = []

  const leftFrontal = normalizeFrontal(state.leftFrontal)
  const rightFrontal = normalizeFrontal(state.rightFrontal)
  const leftMax = normalizeMaxillary(state.leftMaxillary)
  const rightMax = normalizeMaxillary(state.rightMaxillary)

  const isNormalFrontal = (values: ReturnType<typeof normalizeFrontal>) =>
    values.mucosa === 'не изменена' &&
    values.fluid === 'не определяется' &&
    values.pneumatization === 'не изменена' &&
    values.contour === 'четкий' &&
    !values.development

  const leftFrontalNormal = isNormalFrontal(leftFrontal)
  const rightFrontalNormal = isNormalFrontal(rightFrontal)

  if (leftFrontalNormal && rightFrontalNormal) {
    texts.push(
      'Лобные пазухи прозрачные, их контуры четкие ровные, слизистая не утолщена, пневматизация не изменена, патологических теней в проекции пазух не визуализируется.',
    )
  } else {
    const frontalText = (name: string, values: ReturnType<typeof normalizeFrontal>, isNormal: boolean) => {
      if (isNormal) return `${name} без патологии.`

      const parts: string[] = []
      if (values.mucosa !== 'не изменена') parts.push(`слизистая ${values.mucosa}`)
      if (values.fluid === 'экссудат') {
        parts.push('определяется гомогенное затемнение с горизонтальным уровнем')
      }
      if (values.pneumatization !== 'не изменена') {
        parts.push(`пневматизация ${values.pneumatization}`)
      }
      if (values.contour !== 'четкий') parts.push(`контур ${values.contour}`)
      if (values.development === 'недоразвита') parts.push('недоразвита')
      if (values.development === 'не развита') parts.push('не развита')

      return parts.length ? `${name}: ${parts.join(', ')}.` : `${name} без патологии.`
    }

    texts.push(frontalText('Левая лобная пазуха', leftFrontal, leftFrontalNormal))
    texts.push(frontalText('Правая лобная пазуха', rightFrontal, rightFrontalNormal))
  }

  const isNormalMaxillary = (values: ReturnType<typeof normalizeMaxillary>) =>
    values.mucosa === 'не изменена' &&
    values.fluid === 'не определяется' &&
    values.pneumatization === 'не изменена' &&
    values.contour === 'четкий' &&
    !values.cyst

  const leftMaxNormal = isNormalMaxillary(leftMax)
  const rightMaxNormal = isNormalMaxillary(rightMax)

  const maxillaryText = (
    name: string,
    values: ReturnType<typeof normalizeMaxillary>,
    isNormal: boolean,
  ) => {
    if (isNormal) return `${name} без патологии.`

    const parts: string[] = []
    if (values.mucosa !== 'не изменена') parts.push(`слизистая ${values.mucosa}`)
    if (values.fluid === 'экссудат') {
      parts.push('определяется гомогенное затемнение с горизонтальным уровнем')
    }
    if (values.pneumatization !== 'не изменена') {
      parts.push(`пневматизация ${values.pneumatization}`)
    }
    if (values.contour !== 'четкий') parts.push(`контур ${values.contour}`)
    if (values.cyst === 'определяется') {
      parts.push('в проекции пазухи определяется однородная округлая тень с четким контуром')
    }

    return parts.length ? `${name}: ${parts.join(', ')}.` : `${name} без патологии.`
  }

  if (leftMaxNormal && rightMaxNormal) {
    texts.push(
      'Гайморовы пазухи прозрачные, их контуры четкие ровные, слизистая не утолщена, пневматизация не изменена, патологических теней в проекции пазух не визуализируется.',
    )
  } else {
    texts.push(maxillaryText('Левая гайморова пазуха', leftMax, leftMaxNormal))
    texts.push(maxillaryText('Правая гайморова пазуха', rightMax, rightMaxNormal))
  }

  if (!texts.length) {
    return 'Околоносовые пазухи без патологии.'
  }

  return texts.join('\n')
}
