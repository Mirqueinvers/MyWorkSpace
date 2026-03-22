export type ShoulderSide = 'left' | 'right'

export interface ShoulderJointSpaceValue {
  degree: '' | 'не изменена' | 'незначительно' | 'умеренно' | 'выраженно' | 'резко'
  uniformity: '' | 'равномерно' | 'неравномерно'
}

export interface ShoulderJointSpaceState {
  left: ShoulderJointSpaceValue
  right: ShoulderJointSpaceValue
}

export interface ShoulderJointSurfaceState {
  left: '' | 'не изменена' | 'незначительно склерозирована' | 'умеренно склерозирована' | 'выраженно склерозирована' | 'резко склерозирована'
  right: '' | 'не изменена' | 'незначительно склерозирована' | 'умеренно склерозирована' | 'выраженно склерозирована' | 'резко склерозирована'
}

export interface ShoulderOsteophytesState {
  rightUpper: boolean
  rightLower: boolean
  leftUpper: boolean
  leftLower: boolean
}

export interface ShoulderAcromioclavicularSideState {
  isNormal: boolean
  jointSpace: '' | 'незначительно сужена' | 'умеренно сужена' | 'выраженно сужена' | 'резко сужена'
  jointSurface:
    | ''
    | 'незначительно склерозированы'
    | 'умеренно склерозированы'
    | 'выраженно склерозированы'
  osteophytes: Array<'по верхнему краю' | 'по нижнему краю'>
}

export interface ShoulderAcromioclavicularState {
  left: ShoulderAcromioclavicularSideState
  right: ShoulderAcromioclavicularSideState
}

export function createInitialShoulderJointSpaceState(): ShoulderJointSpaceState {
  return {
    left: { degree: '', uniformity: '' },
    right: { degree: '', uniformity: '' },
  }
}

export function createInitialShoulderJointSurfaceState(): ShoulderJointSurfaceState {
  return {
    left: '',
    right: '',
  }
}

export function createInitialShoulderOsteophytesState(): ShoulderOsteophytesState {
  return {
    rightUpper: false,
    rightLower: false,
    leftUpper: false,
    leftLower: false,
  }
}

export function createInitialShoulderAcromioclavicularSideState(): ShoulderAcromioclavicularSideState {
  return {
    isNormal: true,
    jointSpace: '',
    jointSurface: '',
    osteophytes: [],
  }
}

export function createInitialShoulderAcromioclavicularState(): ShoulderAcromioclavicularState {
  return {
    left: createInitialShoulderAcromioclavicularSideState(),
    right: createInitialShoulderAcromioclavicularSideState(),
  }
}

export function generateShoulderJointSpaceDescription(state: ShoulderJointSpaceState) {
  const createSideDescription = (value: ShoulderJointSpaceValue) => {
    if (!value.degree && !value.uniformity) return null
    if (value.degree === 'не изменена') {
      return { degree: value.degree, text: 'не изменена' }
    }
    const text = [value.degree, value.uniformity].filter(Boolean).join(', ')
    return { degree: value.degree, text }
  }

  const right = createSideDescription(state.right)
  const left = createSideDescription(state.left)

  if (!right && !left) {
    return 'Суставные щели плечевых суставов не изменены.'
  }

  if (right && left && right.degree === left.degree && right.text === left.text) {
    if (right.degree === 'не изменена') {
      return 'Суставные щели плечевых суставов не изменены.'
    }
    return `Суставные щели плечевых суставов ${right.text} сужены.`
  }

  if (right && left) {
    const rightPart = right.degree === 'не изменена' ? 'не изменена' : `${right.text} сужена`
    const leftPart = left.degree === 'не изменена' ? 'не изменена' : `${left.text} сужена`
    return `Суставная щель правого плечевого сустава ${rightPart}; левого — ${leftPart}.`
  }

  if (right) {
    return right.degree === 'не изменена'
      ? 'Суставная щель правого плечевого сустава не изменена.'
      : `Суставная щель правого плечевого сустава ${right.text} сужена.`
  }

  if (left) {
    return left.degree === 'не изменена'
      ? 'Суставная щель левого плечевого сустава не изменена.'
      : `Суставная щель левого плечевого сустава ${left.text} сужена.`
  }

  return ''
}

const SHOULDER_SURFACE_MAP_PLURAL: Record<
  Exclude<ShoulderJointSurfaceState['left'], ''>,
  string
> = {
  'не изменена': 'не изменены',
  'незначительно склерозирована': 'незначительно склерозированы',
  'умеренно склерозирована': 'умеренно склерозированы',
  'выраженно склерозирована': 'выраженно склерозированы',
  'резко склерозирована': 'резко склерозированы',
}

export function generateShoulderJointSurfaceDescription(state: ShoulderJointSurfaceState) {
  const { left, right } = state

  if (!left && !right) {
    return 'Суставные поверхности плечевых суставов не изменены.'
  }
  if (left && right && left === right) {
    return `Суставные поверхности плечевых суставов ${SHOULDER_SURFACE_MAP_PLURAL[left]}.`
  }
  if (left && right && left !== right) {
    return `Суставные поверхности правого плечевого сустава ${SHOULDER_SURFACE_MAP_PLURAL[right]}, левого — ${SHOULDER_SURFACE_MAP_PLURAL[left]}.`
  }
  if (right && !left) {
    return `Суставные поверхности плечевых суставов справа ${SHOULDER_SURFACE_MAP_PLURAL[right]}.`
  }
  if (left && !right) {
    return `Суставные поверхности плечевых суставов слева ${SHOULDER_SURFACE_MAP_PLURAL[left]}.`
  }
  return ''
}

export function generateShoulderOsteophytesDescription(state: ShoulderOsteophytesState) {
  if (!state.leftUpper && !state.leftLower && !state.rightUpper && !state.rightLower) {
    return 'Краевые костные разрастания по краям суставных впадин лопаток не определяются.'
  }

  if (state.leftLower && state.rightLower && !state.leftUpper && !state.rightUpper) {
    return 'Определяются краевые костные разрастания по нижнему краю суставных впадин лопаток.'
  }

  if (state.leftUpper && state.rightUpper && !state.leftLower && !state.rightLower) {
    return 'Определяются краевые костные разрастания по верхнему краю суставных впадин лопаток.'
  }

  const parts: string[] = []
  if (state.rightUpper) parts.push('по верхнему краю суставной впадины правой лопатки')
  if (state.rightLower) parts.push('по нижнему краю суставной впадины правой лопатки')
  if (state.leftUpper) parts.push('по верхнему краю суставной впадины левой лопатки')
  if (state.leftLower) parts.push('по нижнему краю суставной впадины левой лопатки')

  return `Определяются краевые костные разрастания ${parts.join(' и ')}.`
}

export function generateShoulderAcromioclavicularDescription(
  state: ShoulderAcromioclavicularState,
) {
  const jointSpaceMap = {
    'незначительно сужена': 'незначительно сужена',
    'умеренно сужена': 'умеренно сужена',
    'выраженно сужена': 'выраженно сужена',
    'резко сужена': 'резко сужена',
  } as const

  const surfaceMap = {
    'незначительно склерозированы': 'незначительно склерозированы',
    'умеренно склерозированы': 'умеренно склерозированы',
    'выраженно склерозированы': 'выраженно склерозированы',
  } as const

  const makeParts = (data: ShoulderAcromioclavicularSideState) => {
    const parts: {
      jointSpace?: string
      jointSurface?: string
      osteophytes?: string
    } = {}
    if (data.jointSpace) parts.jointSpace = jointSpaceMap[data.jointSpace]
    if (data.jointSurface) parts.jointSurface = surfaceMap[data.jointSurface]
    if (data.osteophytes.length) {
      parts.osteophytes =
        data.osteophytes.includes('по верхнему краю') && data.osteophytes.includes('по нижнему краю')
          ? 'по верхнему и нижнему краям'
          : data.osteophytes.join(' и ')
    }
    return parts
  }

  const leftParts = makeParts(state.left)
  const rightParts = makeParts(state.right)

  if (state.left.isNormal && state.right.isNormal) {
    return 'Ключично-акромиальные сочленения без особенностей.'
  }

  const sameJointSpace =
    state.left.jointSpace && state.left.jointSpace === state.right.jointSpace
  const sameSurface =
    state.left.jointSurface && state.left.jointSurface === state.right.jointSurface

  if (sameJointSpace && sameSurface) {
    const parts = [
      `Суставные щели ключично-акромиальных сочленений ${leftParts.jointSpace?.replace('сужена', 'сужены')}`,
      `суставные поверхности ${leftParts.jointSurface}`,
    ]

    if (state.left.osteophytes.length && state.right.osteophytes.length) {
      if (leftParts.osteophytes === rightParts.osteophytes) {
        parts.push(`определяются краевые костные разрастания ${leftParts.osteophytes}`)
      } else {
        parts.push(
          `определяются краевые костные разрастания ${leftParts.osteophytes} левого и ${rightParts.osteophytes} правого ключично-акромиальных сочленений`,
        )
      }
    } else if (state.left.osteophytes.length) {
      parts.push(
        `определяются краевые костные разрастания ${leftParts.osteophytes} левого ключично-акромиального сочленения`,
      )
    } else if (state.right.osteophytes.length) {
      parts.push(
        `определяются краевые костные разрастания ${rightParts.osteophytes} правого ключично-акромиального сочленения`,
      )
    }

    const text = `${parts.filter(Boolean).join(', ')}.`
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const makeSideDescription = (
    label: 'Левое' | 'Правое',
    side: ShoulderAcromioclavicularSideState,
    parts: ReturnType<typeof makeParts>,
  ) => {
    if (side.isNormal) {
      return `${label} ключично-акромиальное сочленение без особенностей`
    }

    const result: string[] = []
    if (parts.jointSpace) result.push(`суставная щель ${parts.jointSpace}`)
    if (parts.jointSurface) result.push(`суставные поверхности ${parts.jointSurface}`)
    if (parts.osteophytes) {
      result.push(`определяются краевые костные разрастания ${parts.osteophytes}`)
    }
    return `${label} ключично-акромиальное сочленение: ${result.join(', ')}`
  }

  return `${makeSideDescription('Левое', state.left, leftParts)}.\n${makeSideDescription(
    'Правое',
    state.right,
    rightParts,
  )}.`
}
