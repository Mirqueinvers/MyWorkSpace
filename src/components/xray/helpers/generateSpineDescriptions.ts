export const SPINE_VERTEBRAE_GROUPS = {
  'Шейный отдел': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'],
  'Грудной отдел': [
    'Th1',
    'Th2',
    'Th3',
    'Th4',
    'Th5',
    'Th6',
    'Th7',
    'Th8',
    'Th9',
    'Th10',
    'Th11',
    'Th12',
  ],
  'Поясничный отдел': ['L1', 'L2', 'L3', 'L4', 'L5'],
  'Крестцовый отдел': ['S1', 'S2', 'S3', 'S4', 'S5'],
} as const

export const SPINE_VERTEBRAE: string[] = Object.values(SPINE_VERTEBRAE_GROUPS).flat()

export type SpineSeverity = 'умеренно' | 'выраженно' | 'резко'
export type SpineSurface = 'передние' | 'боковые'
export type SpineCurveType = 'не искривлена' | 'C-образно' | 'S-образно'
export type SpineDirection = 'кпереди' | 'кзади'
export type SpineMagnitude =
  | '1/2 тела позвонка'
  | '1/3 тела позвонка'
  | '1/4 тела позвонка'
  | '1/5 тела позвонка'

export const SPINE_SEVERITIES: SpineSeverity[] = ['умеренно', 'выраженно', 'резко']
export const SPINE_SURFACES: SpineSurface[] = ['передние', 'боковые']
export const SPINE_CURVE_TYPES: SpineCurveType[] = ['не искривлена', 'C-образно', 'S-образно']
export const SPINE_DIRECTIONS: SpineDirection[] = ['кпереди', 'кзади']
export const SPINE_MAGNITUDES: SpineMagnitude[] = [
  '1/2 тела позвонка',
  '1/3 тела позвонка',
  '1/4 тела позвонка',
  '1/5 тела позвонка',
]

export interface SpineInstabilityState {
  mode: 'Норма' | 'Нестабильность'
  selectedDirection: SpineDirection | null
  selectedMagnitude: SpineMagnitude | null
  selectedVertebrae: string[]
}

export interface SpineCurvatureState {
  curveType: SpineCurveType
  selected: string[]
  cobbAngle: string
  cCurveDirection: 'влево' | 'вправо'
  torsion: boolean
}

export interface SpineEndplatesShmorlPoint {
  vertebra: string
  side: 'верхней' | 'нижней'
}

export interface SpineEndplatesState {
  unchanged: boolean
  activeSeverity: SpineSeverity | null
  selected: Record<SpineSeverity, string[]>
  activeShmorl: boolean
  shmorl: SpineEndplatesShmorlPoint[]
}

export interface SpineDiscsState {
  unchanged: boolean
  activeSeverity: SpineSeverity | null
  selected: Record<SpineSeverity, string[]>
}

export interface SpineOsteophytesState {
  activeSurface: SpineSurface
  selected: Record<SpineSurface, string[]>
}

export function buildSpineSegments(vertebraeList: string[], allOrdered = SPINE_VERTEBRAE) {
  if (!Array.isArray(vertebraeList) || vertebraeList.length === 0) return []

  const orderIndex = new Map(allOrdered.map((vertebra, index) => [vertebra, index]))
  const sorted = vertebraeList
    .slice()
    .sort((left, right) => (orderIndex.get(left) ?? 0) - (orderIndex.get(right) ?? 0))

  const ranges: string[] = []
  let start = sorted[0]
  let previous = sorted[0]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const previousIndex = orderIndex.get(previous) ?? 0
    const currentIndex = orderIndex.get(current) ?? 0
    if (currentIndex === previousIndex + 1) {
      previous = current
      continue
    }
    ranges.push(start === previous ? start : `${start}-${previous}`)
    start = current
    previous = current
  }

  ranges.push(start === previous ? start : `${start}-${previous}`)
  return ranges
}

export function joinSpineWithAnd(values: string[]) {
  if (values.length <= 1) return values[0] ?? ''
  return `${values.slice(0, -1).join(', ')} и ${values.at(-1)}`
}

export function createInitialSpineDiscsState(): SpineDiscsState {
  return {
    unchanged: true,
    activeSeverity: null,
    selected: {
      умеренно: [],
      выраженно: [],
      резко: [],
    },
  }
}

export function createInitialSpineEndplatesState(): SpineEndplatesState {
  return {
    unchanged: true,
    activeSeverity: null,
    selected: {
      умеренно: [],
      выраженно: [],
      резко: [],
    },
    activeShmorl: false,
    shmorl: [],
  }
}

export function createInitialSpineOsteophytesState(): SpineOsteophytesState {
  return {
    activeSurface: 'передние',
    selected: {
      передние: [],
      боковые: [],
    },
  }
}

export function createInitialSpineInstabilityState(): SpineInstabilityState {
  return {
    mode: 'Норма',
    selectedDirection: null,
    selectedMagnitude: null,
    selectedVertebrae: [],
  }
}

export function createInitialSpineCurvatureState(): SpineCurvatureState {
  return {
    curveType: 'не искривлена',
    selected: [],
    cobbAngle: '',
    cCurveDirection: 'влево',
    torsion: false,
  }
}

export function generateSpineRangeDescription(selected: string[]) {
  if (selected.length !== 2) return ''
  const [from, to] = selected
    .slice()
    .sort((left, right) => SPINE_VERTEBRAE.indexOf(left) - SPINE_VERTEBRAE.indexOf(right))
  return `Позвоночный столб визуализируется на уровне ${from}-${to}.`
}

export function generateSpineDiscsDescription(state: SpineDiscsState) {
  if (state.unchanged) {
    return 'Высота пространств межпозвонковых дисков не изменена.'
  }

  const parts = SPINE_SEVERITIES.flatMap((severity) => {
    const segments = buildSpineSegments(state.selected[severity])
    if (!segments.length) return []
    return `${severity} снижена в сегментах ${segments.join(', ')}`
  })

  if (!parts.length) return ''
  return `Высота пространств межпозвонковых дисков ${parts.join(', ')}.`
}

export function generateSpineEndplatesDescription(state: SpineEndplatesState) {
  if (state.unchanged && !state.shmorl.length) {
    return 'Замыкательные пластинки ровные, чёткие, склеротических и деструктивных изменений не выявлено.'
  }

  let text = ''

  const sclerosisParts = SPINE_SEVERITIES.flatMap((severity) => {
    const segments = buildSpineSegments(state.selected[severity])
    if (!segments.length) return []
    const severityText =
      severity === 'умеренно'
        ? 'умеренно выраженный'
        : severity === 'выраженно'
          ? 'выраженный'
          : 'резко выраженный'
    return `${severityText} склероз смежных замыкательных пластинок тел ${segments.join(', ')}`
  })

  if (sclerosisParts.length) {
    text = `Определяется ${sclerosisParts.join(', ')}.`
  }

  if (state.shmorl.length) {
    const grouped = state.shmorl.reduce<Record<string, Array<'верхней' | 'нижней'>>>(
      (accumulator, item) => {
        accumulator[item.vertebra] ??= []
        accumulator[item.vertebra].push(item.side)
        return accumulator
      },
      {},
    )

    const shmorlTexts = Object.entries(grouped).map(([vertebra, sides]) => {
      if (sides.length === 2) {
        return `верхней и нижней замыкательных пластинок тела ${vertebra} позвонка`
      }
      return `${sides[0]} замыкательной пластинки тела ${vertebra} позвонка`
    })

    const shmorlDescription = `Определяется узуративный дефект ${joinSpineWithAnd(shmorlTexts)}.`
    text = text ? `${text} ${shmorlDescription}` : shmorlDescription
  }

  return text
}

export function generateSpineOsteophytesDescription(state: SpineOsteophytesState) {
  const parts: string[] = []

  if (state.selected.передние.length) {
    parts.push(
      `по передним поверхностям тел ${buildSpineSegments(state.selected.передние).join(', ')}`,
    )
  }

  if (state.selected.боковые.length) {
    parts.push(
      `${parts.length ? 'и ' : ''}боковым поверхностям тел ${buildSpineSegments(
        state.selected.боковые,
      ).join(', ')}`,
    )
  }

  if (!parts.length) return ''
  return `Определяются краевые костные разрастания ${parts.join(' ')}.`
}

export function generateSpineInstabilityDescription(state: SpineInstabilityState) {
  if (state.mode === 'Норма') {
    return 'Соотношение задних отделов тел позвонков не изменено.'
  }

  if (!state.selectedDirection || !state.selectedMagnitude || !state.selectedVertebrae.length) {
    return ''
  }

  const segments = buildSpineSegments(state.selectedVertebrae)
  const firstVertebra = state.selectedVertebrae[0]
  return `Определяется нестабильность позвонков в сегменте ${segments.join(
    ', ',
  )} за счет смещения ${firstVertebra} ${state.selectedDirection.toLowerCase()} на величину ${
    state.selectedMagnitude
  }.`
}

export function generateSpineCurvatureDescription(state: SpineCurvatureState) {
  if (state.curveType === 'не искривлена') {
    return 'Ось позвоночника не искривлена.'
  }

  const selected = state.selected
    .slice()
    .sort((left, right) => SPINE_VERTEBRAE.indexOf(left) - SPINE_VERTEBRAE.indexOf(right))

  let text = ''

  if (state.curveType === 'C-образно' && selected.length === 3) {
    const [from, mid, to] = selected
    text = `Ось позвоночника C-образно искривлена ${state.cCurveDirection} на уровне ${from}-${to} с высотой в ${mid}`
    if (state.cobbAngle.trim()) {
      text += `, угол отклонения ${state.cobbAngle}° по методу Кобба`
    }
    text += '.'
  }

  if (state.curveType === 'S-образно' && selected.length === 4) {
    const [from, mid1, mid2, to] = selected
    text = `Позвоночный столб S-образно искривлен на уровне ${from}-${to} с высотой искривления в ${mid1} и ${mid2}.`
  }

  if (state.torsion && text) {
    text = text.replace(/\.$/, '')
    text += ', определяется торсия позвонков на высоте изгиба.'
  }

  return text
}
