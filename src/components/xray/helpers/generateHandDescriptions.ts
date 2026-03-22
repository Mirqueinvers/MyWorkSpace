export interface HandJointMeta {
  key: string
  label: string
  side: 'left' | 'right'
  group: 'Cmc' | 'Mcp' | 'Pip' | 'Dip' | 'Ip' | 'Wrist'
}

export const HAND_JOINTS: HandJointMeta[] = [
  { key: 'rightCmc1', label: 'I', side: 'right', group: 'Cmc' },
  { key: 'rightCmc2', label: 'II', side: 'right', group: 'Cmc' },
  { key: 'rightCmc3', label: 'III', side: 'right', group: 'Cmc' },
  { key: 'rightCmc4', label: 'IV', side: 'right', group: 'Cmc' },
  { key: 'rightCmc5', label: 'V', side: 'right', group: 'Cmc' },
  { key: 'rightMcp1', label: 'I', side: 'right', group: 'Mcp' },
  { key: 'rightMcp2', label: 'II', side: 'right', group: 'Mcp' },
  { key: 'rightMcp3', label: 'III', side: 'right', group: 'Mcp' },
  { key: 'rightMcp4', label: 'IV', side: 'right', group: 'Mcp' },
  { key: 'rightMcp5', label: 'V', side: 'right', group: 'Mcp' },
  { key: 'rightPip2', label: 'II', side: 'right', group: 'Pip' },
  { key: 'rightPip3', label: 'III', side: 'right', group: 'Pip' },
  { key: 'rightPip4', label: 'IV', side: 'right', group: 'Pip' },
  { key: 'rightPip5', label: 'V', side: 'right', group: 'Pip' },
  { key: 'rightDip2', label: 'II', side: 'right', group: 'Dip' },
  { key: 'rightDip3', label: 'III', side: 'right', group: 'Dip' },
  { key: 'rightDip4', label: 'IV', side: 'right', group: 'Dip' },
  { key: 'rightDip5', label: 'V', side: 'right', group: 'Dip' },
  { key: 'rightIp1', label: 'I', side: 'right', group: 'Ip' },
  { key: 'rightWrist', label: 'ЛЗС', side: 'right', group: 'Wrist' },
  { key: 'leftCmc1', label: 'I', side: 'left', group: 'Cmc' },
  { key: 'leftCmc2', label: 'II', side: 'left', group: 'Cmc' },
  { key: 'leftCmc3', label: 'III', side: 'left', group: 'Cmc' },
  { key: 'leftCmc4', label: 'IV', side: 'left', group: 'Cmc' },
  { key: 'leftCmc5', label: 'V', side: 'left', group: 'Cmc' },
  { key: 'leftMcp1', label: 'I', side: 'left', group: 'Mcp' },
  { key: 'leftMcp2', label: 'II', side: 'left', group: 'Mcp' },
  { key: 'leftMcp3', label: 'III', side: 'left', group: 'Mcp' },
  { key: 'leftMcp4', label: 'IV', side: 'left', group: 'Mcp' },
  { key: 'leftMcp5', label: 'V', side: 'left', group: 'Mcp' },
  { key: 'leftPip2', label: 'II', side: 'left', group: 'Pip' },
  { key: 'leftPip3', label: 'III', side: 'left', group: 'Pip' },
  { key: 'leftPip4', label: 'IV', side: 'left', group: 'Pip' },
  { key: 'leftPip5', label: 'V', side: 'left', group: 'Pip' },
  { key: 'leftDip2', label: 'II', side: 'left', group: 'Dip' },
  { key: 'leftDip3', label: 'III', side: 'left', group: 'Dip' },
  { key: 'leftDip4', label: 'IV', side: 'left', group: 'Dip' },
  { key: 'leftDip5', label: 'V', side: 'left', group: 'Dip' },
  { key: 'leftIp1', label: 'I', side: 'left', group: 'Ip' },
  { key: 'leftWrist', label: 'ЛЗС', side: 'left', group: 'Wrist' },
] as const

export const HAND_DEGREES = [
  'Не изменены',
  'Незначительно',
  'Умеренно',
  'Выраженно',
  'Резко',
] as const

export type HandDegree = (typeof HAND_DEGREES)[number]
export type HandJointKey = (typeof HAND_JOINTS)[number]['key']
export type HandJointSelection = Partial<Record<HandDegree | 'selected', boolean>>
export type HandSelectionState = Record<HandJointKey, HandJointSelection>

const GROUP_NAMES = {
  Mcp: {
    plural: 'пястно-фаланговых суставах',
    single: 'пястно-фаланговом суставе',
    singleGenitive: 'пястно-фалангового сустава',
  },
  Pip: {
    plural: 'проксимальных межфаланговых суставах',
    single: 'проксимальном межфаланговом суставе',
    singleGenitive: 'проксимального межфалангового сустава',
  },
  Dip: {
    plural: 'дистальных межфаланговых суставах',
    single: 'дистальном межфаланговом суставе',
    singleGenitive: 'дистального межфалангового сустава',
  },
  Cmc: {
    plural: 'пястно-запястных суставах',
    single: 'пястно-запястном суставе',
    singleGenitive: 'пястно-запястного сустава',
  },
  Wrist: {
    plural: 'лучезапястных суставах',
    single: 'лучезапястном суставе',
    singleGenitive: 'лучезапястного сустава',
  },
  Ip: {
    plural: 'межфаланговых суставах I пальца',
    single: 'межфаланговом суставе I пальца',
    singleGenitive: 'межфалангового сустава I пальца',
  },
} as const

const SIDE_NAMES = { right: 'правой', left: 'левой' } as const
const ROMAN_TO_NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5 } as const
const NUM_TO_ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' } as const

export function createInitialHandSelectionState(): HandSelectionState {
  return Object.fromEntries(HAND_JOINTS.map((joint) => [joint.key, {}])) as HandSelectionState
}

function compressFingerLabels(labels: string[]) {
  const nums = labels
    .map((label) => ROMAN_TO_NUM[label as keyof typeof ROMAN_TO_NUM])
    .filter(Boolean)
    .sort((a, b) => a - b)
  if (!nums.length) return ''

  const ranges: string[] = []
  let start = nums[0]
  let end = nums[0]

  for (let index = 1; index <= nums.length; index += 1) {
    if (nums[index] === end + 1) {
      end = nums[index]
      continue
    }

    ranges.push(
      start === end
        ? NUM_TO_ROMAN[start as keyof typeof NUM_TO_ROMAN]
        : `${NUM_TO_ROMAN[start as keyof typeof NUM_TO_ROMAN]}-${NUM_TO_ROMAN[end as keyof typeof NUM_TO_ROMAN]}`,
    )
    start = nums[index]
    end = nums[index]
  }

  return ranges.join(', ')
}

function getSelectedByDegree(state: HandSelectionState, degree: HandDegree | 'selected') {
  const grouped: Record<string, Record<string, string[]>> = {}

  HAND_JOINTS.forEach((joint) => {
    const selected = state[joint.key]?.[degree]
    if (!selected) return
    grouped[joint.side] ??= {}
    grouped[joint.side][joint.group] ??= []
    grouped[joint.side][joint.group].push(joint.label)
  })

  return grouped
}

export function generateHandJointDescription(
  state: HandSelectionState,
  mode: 'gaps' | 'surfaces',
) {
  const hasAnyDegree = HAND_DEGREES.some((degree) =>
    Object.values(state).some((joint) => joint[degree]),
  )

  if (!hasAnyDegree) {
    return mode === 'gaps'
      ? 'Суставные щели кистей рук равномерной высоты.'
      : 'Суставные поверхности кистей рук ровные, без деформации.'
  }

  const degreeParts: string[] = []

  ;(['Незначительно', 'Умеренно', 'Выраженно', 'Резко'] as const).forEach((degree) => {
    const grouped = getSelectedByDegree(state, degree)

    ;(['right', 'left'] as const).forEach((side) => {
      const types = grouped[side]
      if (!types) return

      Object.entries(types).forEach(([groupKey, labels]) => {
        const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
        if (!group || !labels.length) return

        const action =
          mode === 'gaps'
            ? `${degree.toLowerCase()} сужены в`
            : `${degree.toLowerCase()} склерозированы в`

        if (groupKey === 'Wrist') {
          degreeParts.push(`${action} ${group.single} ${SIDE_NAMES[side]} кисти`)
          return
        }

        if (labels.length === 1 || groupKey === 'Ip') {
          degreeParts.push(`${action} ${group.single} ${labels[0]} пальца ${SIDE_NAMES[side]} кисти`)
          return
        }

        const fingers = compressFingerLabels(labels)
        degreeParts.push(`${action} ${group.plural} ${fingers} пальцев ${SIDE_NAMES[side]} кисти`)
      })
    })
  })

  return `${
    mode === 'gaps' ? 'Суставные щели' : 'Суставные поверхности'
  } ${degreeParts.join('; ')}.`
}

export function generateHandOsteophytesDescription(state: HandSelectionState) {
  const grouped = getSelectedByDegree(state, 'selected')
  const parts: string[] = []

  ;(['right', 'left'] as const).forEach((side) => {
    const types = grouped[side]
    if (!types) return

    Object.entries(types).forEach(([groupKey, labels]) => {
      const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
      if (!group || !labels.length) return

      if (groupKey === 'Wrist') {
        parts.push(`${group.singleGenitive} ${SIDE_NAMES[side]} кисти`)
        return
      }

      if (labels.length === 1 || groupKey === 'Ip') {
        parts.push(`${group.singleGenitive} ${labels[0]} пальца ${SIDE_NAMES[side]} кисти`)
        return
      }

      const fingers = compressFingerLabels(labels)
      parts.push(`${fingers} ${group.plural} ${SIDE_NAMES[side]} кисти`)
    })
  })

  if (!parts.length) {
    return 'Краевые костные разрастания не выявлены.'
  }

  return `Определяются краевые костные разрастания по боковым поверхностям ${parts.join('; ')}.`
}

export function generateHandCongruencyDescription(state: HandSelectionState) {
  const grouped = getSelectedByDegree(state, 'selected')
  const parts: string[] = []

  ;(['right', 'left'] as const).forEach((side) => {
    const types = grouped[side]
    if (!types) return

    Object.entries(types).forEach(([groupKey, labels]) => {
      const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
      if (!group || !labels.length) return

      if (groupKey === 'Wrist') {
        parts.push(`${group.single} ${SIDE_NAMES[side]} кисти`)
        return
      }

      if (labels.length === 1 || groupKey === 'Ip') {
        parts.push(`${group.single} ${labels[0]} пальца ${SIDE_NAMES[side]} кисти`)
        return
      }

      const fingers = compressFingerLabels(labels)
      parts.push(`${fingers} ${group.plural} ${SIDE_NAMES[side]} кисти`)
    })
  })

  if (!parts.length) {
    return 'Конгруэнтность суставных поверхностей не нарушена.'
  }

  return `Нарушена конгруэнтность в ${parts.join('; ')}.`
}
