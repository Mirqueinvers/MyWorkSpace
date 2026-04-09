export const XRAY_TABS = ['Главная', 'Рентген журнал', 'Фл журнал', 'Дозы', 'Статистика'] as const

export const XRAY_STUDY_AREAS = [
  'Органы грудной клетки',
  'Верхние конечности',
  'Нижние конечности',
  'Шейный отдел позвоночника',
  'Грудной отдел позвоночника',
  'Поясничный отдел позвоночника',
  'Тазобедренные суставы',
  'Ребра и грудина',
  'Череп, гол. мозг, ЧЛО',
  'Органы брюшной полости',
  'Почки, мочевыводящая система',
] as const

export const XRAY_STUDY_TYPES = ['Рентген', 'Урография'] as const

export const XRAY_CASSETTES = ['13х18', '18х24', '24х30', '30х40', '35х35'] as const

export const XRAY_STUDY_COUNTS = [1, 2, 3, 4, 5, 6] as const

export const XRAY_STUDY_AREA_PRESETS: Partial<
  Record<
    (typeof XRAY_STUDY_AREAS)[number],
    {
      cassette?: (typeof XRAY_CASSETTES)[number]
      studyCount?: (typeof XRAY_STUDY_COUNTS)[number]
      radiationDose?: string
    }
  >
> = {
  [XRAY_STUDY_AREAS[0]]: {
    cassette: XRAY_CASSETTES[4],
    studyCount: 1,
    radiationDose: '0.15',
  },
  [XRAY_STUDY_AREAS[1]]: {
    radiationDose: '0.02',
  },
  [XRAY_STUDY_AREAS[2]]: {
    radiationDose: '0.02',
  },
  [XRAY_STUDY_AREAS[3]]: {
    cassette: XRAY_CASSETTES[1],
    studyCount: 2,
    radiationDose: '0.33',
  },
  [XRAY_STUDY_AREAS[4]]: {
    cassette: XRAY_CASSETTES[3],
    studyCount: 2,
    radiationDose: '0.45',
  },
  [XRAY_STUDY_AREAS[5]]: {
    cassette: XRAY_CASSETTES[3],
    studyCount: 2,
    radiationDose: '3.3',
  },
  [XRAY_STUDY_AREAS[6]]: {
    cassette: XRAY_CASSETTES[3],
    studyCount: 1,
    radiationDose: '1.5',
  },
  [XRAY_STUDY_AREAS[8]]: {
    cassette: XRAY_CASSETTES[1],
    studyCount: 1,
    radiationDose: '0.11',
  },
}

export const XRAY_REFERRED_BY_STORAGE_KEY = 'xray-referred-by-history'

export const XRAY_STUDY_TEMPLATES = [
  'Универсальный',
  'Рентгенография коленных суставов',
  'Рентгенография тазобедренных суставов',
  'Рентгенография голеностопных суставов',
  'Рентгенография стоп',
  'Плоскостопие',
  'Рентгенография пяточных костей',
  'Рентгенография поясничного отдела позвоночника',
  'Рентгенография грудного отдела позвоночника',
  'Рентгенография грудопоясничного отдела позвоночника',
  'Рентгенография шейного отдела позвоночника',
  'Рентгенография плечевых суставов',
  'Рентгенография луче-запястных суставов',
  'Рентгенография кистей',
  'Рентгенография придаточных пазух носа',
  'Рентгенография органов грудной клетки',
  'Рентгенография грудной клетки',
  'Рентгенография обзорная брюшной полости',
] as const

export const XRAY_KNEE_STUDY_TEMPLATE = 'Рентгенография коленных суставов'
export const XRAY_ANKLE_STUDY_TEMPLATE = 'Рентгенография голеностопных суставов'
export const XRAY_LUMBAR_SPINE_STUDY_TEMPLATE = 'Рентгенография поясничного отдела позвоночника'
export const XRAY_THORACIC_SPINE_STUDY_TEMPLATE = 'Рентгенография грудного отдела позвоночника'
export const XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE =
  'Рентгенография грудопоясничного отдела позвоночника'
export const XRAY_CERVICAL_SPINE_STUDY_TEMPLATE = 'Рентгенография шейного отдела позвоночника'
export const XRAY_SHOULDER_STUDY_TEMPLATE = 'Рентгенография плечевых суставов'
export const XRAY_WRIST_STUDY_TEMPLATE = 'Рентгенография луче-запястных суставов'

export const XRAY_HAND_STUDY_TEMPLATE = 'Рентгенография кистей'
export const XRAY_PARANASAL_STUDY_TEMPLATE = 'Рентгенография придаточных пазух носа'

export const XRAY_KNEE_STUDY_OPTIONS = [
  'В прямой проекции',
  'В прямой и боковой проекциях',
  'Левый (прямая + боковая)',
  'Правый (прямая + боковая)',
] as const

export const XRAY_ANKLE_STUDY_OPTIONS = [
  'В прямой проекции',
  'В прямой и боковой проекциях',
  'Левый (прямая + боковая)',
  'Правый (прямая + боковая)',
] as const

export const XRAY_SPINE_STUDY_OPTIONS = [
  'В прямой проекции',
  'В прямой и боковой проекциях',
] as const

export const XRAY_SHOULDER_STUDY_OPTIONS = [
  'В прямой проекции',
  'Левый в прямой проекции',
  'Правый в прямой проекции',
] as const

export const XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS = {
  'В прямой проекции': 'Рентгенография коленных суставов в прямой проекции',
  'В прямой и боковой проекциях': 'Рентгенография коленных суставов в прямой и боковой проекциях',
  'Левый (прямая + боковая)': 'Рентгенография левого коленного сустава в двух проекциях',
  'Правый (прямая + боковая)': 'Рентгенография правого коленного сустава в двух проекциях',
} as const

export const XRAY_ANKLE_STUDY_OPTION_DESCRIPTIONS = {
  'В прямой проекции': 'Рентгенография голеностопных суставов в прямой проекции',
  'В прямой и боковой проекциях': 'Рентгенография голеностопных суставов в прямой и боковой проекциях',
  'Левый (прямая + боковая)': 'Рентгенография левого голеностопного сустава в двух проекциях',
  'Правый (прямая + боковая)': 'Рентгенография правого голеностопного сустава в двух проекциях',
} as const

export const XRAY_SPINE_STUDY_OPTION_DESCRIPTIONS = {
  [XRAY_LUMBAR_SPINE_STUDY_TEMPLATE]: {
    'В прямой проекции': 'Рентгенография поясничного отдела позвоночника в прямой проекции',
    'В прямой и боковой проекциях':
      'Рентгенография поясничного отдела позвоночника в прямой и боковой проекциях',
  },
  [XRAY_THORACIC_SPINE_STUDY_TEMPLATE]: {
    'В прямой проекции': 'Рентгенография грудного отдела позвоночника в прямой проекции',
    'В прямой и боковой проекциях':
      'Рентгенография грудного отдела позвоночника в прямой и боковой проекциях',
  },
  [XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE]: {
    'В прямой проекции': 'Рентгенография грудопоясничного отдела позвоночника в прямой проекции',
    'В прямой и боковой проекциях':
      'Рентгенография грудопоясничного отдела позвоночника в прямой и боковой проекциях',
  },
  [XRAY_CERVICAL_SPINE_STUDY_TEMPLATE]: {
    'В прямой проекции': 'Рентгенография шейного отдела позвоночника в прямой проекции',
    'В прямой и боковой проекциях':
      'Рентгенография шейного отдела позвоночника в прямой и боковой проекциях',
  },
} as const

export const XRAY_SHOULDER_STUDY_OPTION_DESCRIPTIONS = {
  'В прямой проекции': 'Рентгенография плечевых суставов в прямой проекции',
  'Левый в прямой проекции': 'Рентгенография левого плечевого сустава в прямой проекции',
  'Правый в прямой проекции': 'Рентгенография правого плечевого сустава в прямой проекции',
} as const

export const XRAY_HIP_STUDY_TEMPLATE = 'Рентгенография тазобедренных суставов'
export const XRAY_HIP_STUDY_DESCRIPTION =
  'Рентгенография тазобедренных суставов в прямой проекции'
export const XRAY_WRIST_STUDY_DESCRIPTION =
  'Рентгенография луче-запястных суставов в прямой проекции'
export const XRAY_HAND_STUDY_DESCRIPTION = 'Рентгенография кистей в прямой проекции'
export const XRAY_PARANASAL_STUDY_DESCRIPTION =
  'Рентгенография придаточных пазух носа в прямой проекции'
export const XRAY_PARANASAL_NORMAL_DESCRIPTION = [
  'Лобные и гайморовы пазухи прозрачные, их контуры четкие ровные, слизистая не утолщена, пневматизация не изменена, патологических теней в проекции пазух не визуализируется.',
  'Носовые ходы свободны.',
  'Носовая перегородка не искривлена.',
].join('\n')
export const XRAY_NASAL_PASSAGES_OPTIONS = [
  'Свободны',
  'Сужены',
  'Отечные',
  'Содержат патологическое содержимое',
  'Носовые ходы без особенностей',
] as const
export const XRAY_NASAL_SEPTUM_OPTIONS = [
  'Не искривлена',
  'Искривлена влево',
  'Искривлена вправо',
  'S-образно искривлена',
  'Искривлена в костном отделе',
  'Искривлена в хрящевом отделе',
  'Гипертрофия носовых раковин',
] as const
export const XRAY_HAND_NORMAL_DESCRIPTION = [
  'Суставные щели мелких суставов кистей сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')
export const XRAY_WRIST_NORMAL_DESCRIPTION = [
  'Суставные щели лучезапястных суставов сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_FOOT_STUDY_TEMPLATE = 'Рентгенография стоп'
export const XRAY_FOOT_STUDY_DESCRIPTION = 'Рентгенография стоп в прямой проекции'
export const XRAY_FLATFOOT_STUDY_TEMPLATE = 'Плоскостопие'
export const XRAY_FLATFOOT_STUDY_DESCRIPTION = 'Рентгенография стоп в боковой проекции'
export const XRAY_FLATFOOT_NORMAL_DESCRIPTION =
  'Признаков плоскостопия не выявлено. Форма стоп нормальная, своды сохранены.'
export const XRAY_CALCANEUS_STUDY_TEMPLATE = 'Рентгенография пяточных костей'
export const XRAY_CALCANEUS_STUDY_DESCRIPTION =
  'Рентгенография пяточных костей в боковой проекции'
export const XRAY_CALCANEUS_NORMAL_DESCRIPTION = [
  'Остеофиты пяточных костей не выявлены.',
  'Форма костей не изменена, структура однородная.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
].join('\n')
export const XRAY_SHOULDER_NORMAL_DESCRIPTION = [
  'Суставные щели плечевых суставов сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
  'Ключично-акромиальные сочленения без патологии.',
].join('\n')
export const XRAY_FOOT_NORMAL_DESCRIPTION = [
  'Суставные щели стоп сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_SPINE_LORDOSIS_OPTIONS = ['не изменен', 'сглажен'] as const
export const XRAY_SPINE_KYPHOSIS_OPTIONS = ['не изменен', 'увеличен', 'сглажен'] as const
export const XRAY_SPINE_INTEGRITY_OPTIONS = ['Не нарушена', 'Нарушена'] as const
export const XRAY_SPINE_PARAARTICULAR_OPTIONS = ['Без изменений', 'Изменения'] as const

export const XRAY_SPINE_NORMAL_DESCRIPTION = [
  'Высота пространств межпозвонковых дисков не изменена.',
  'Замыкательные пластинки ровные, чёткие, склеротических и деструктивных изменений не выявлено.',
  'Соотношение задних отделов тел позвонков не изменено.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_HIP_ENDOPROSTHESIS_OPTIONS = [
  'левого тазобедренного сустава',
  'правого тазобедренного сустава',
] as const

export const XRAY_HIP_CONGRUENCY_OPTIONS = [
  'не нарушена',
  'нарушена в левом',
  'нарушена в правом',
] as const

export const XRAY_HIP_INTEGRITY_OPTIONS = ['Не нарушена', 'Нарушена'] as const

export const XRAY_HIP_PARAARTICULAR_OPTIONS = ['Без изменений', 'Изменения'] as const

export const XRAY_HIP_PHLEBOLITES_DESCRIPTION =
  'В проекции полости малого таза определяются единичные тени флеболитов.'

export const XRAY_HIP_NORMAL_DESCRIPTION = [
  'Суставные щели тазобедренных суставов сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_ANKLE_NORMAL_DESCRIPTION = [
  'Суставные щели голеностопных суставов сохранены, равномерные.',
  'Суставные поверхности голеностопных суставов ровные, чёткие, без признаков деформации.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_KNEE_NORMAL_DESCRIPTION = [
  'Суставные щели коленных суставов сохранены, равномерные.',
  'Суставные поверхности ровные, чёткие, без признаков деформации.',
  'Бугорки межмыщелковых возвышений не изменены.',
  'Конгруэнтность суставных поверхностей не нарушена.',
  'Костно-травматических и костно-деструктивных изменений не выявлено.',
  'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.',
].join('\n')

export const XRAY_KNEE_BUMPS_OPTIONS = [
  '\u043d\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u044b',
  '\u0437\u0430\u043e\u0441\u0442\u0440\u0435\u043d\u044b',
  '\u0443\u043f\u043b\u043e\u0449\u0435\u043d\u044b',
  '\u0437\u0430\u043e\u0441\u0442\u0440\u0435\u043d\u044b \u0441\u043f\u0440\u0430\u0432\u0430',
  '\u0437\u0430\u043e\u0441\u0442\u0440\u0435\u043d\u044b \u0441\u043b\u0435\u0432\u0430',
  '\u0443\u043f\u043b\u043e\u0449\u0435\u043d\u044b \u0441\u043f\u0440\u0430\u0432\u0430',
  '\u0443\u043f\u043b\u043e\u0449\u0435\u043d\u044b \u0441\u043b\u0435\u0432\u0430',
] as const
export const XRAY_KNEE_CONGRUENCY_OPTIONS = [
  '\u043d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043b\u0435\u0432\u043e\u043c',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043f\u0440\u0430\u0432\u043e\u043c',
] as const
export const XRAY_KNEE_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_KNEE_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
export const XRAY_KNEE_ENDOPROSTHESIS_OPTIONS = [
  'левого коленного сустава',
  'правого коленного сустава',
  'обоих коленных суставов',
] as const

export const XRAY_ANKLE_CONGRUENCY_OPTIONS = [
  '\u043d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043b\u0435\u0432\u043e\u043c',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043f\u0440\u0430\u0432\u043e\u043c',
] as const
export const XRAY_ANKLE_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_ANKLE_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
export const XRAY_FOOT_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_FOOT_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
export const XRAY_SHOULDER_CONGRUENCY_OPTIONS = [
  '\u043d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043b\u0435\u0432\u043e\u043c',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043f\u0440\u0430\u0432\u043e\u043c',
] as const
export const XRAY_SHOULDER_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_SHOULDER_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
export const XRAY_WRIST_CONGRUENCY_OPTIONS = [
  '\u043d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043b\u0435\u0432\u043e\u043c',
  '\u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430 \u0432 \u043f\u0440\u0430\u0432\u043e\u043c',
] as const
export const XRAY_WRIST_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_WRIST_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
export const XRAY_HAND_INTEGRITY_OPTIONS = ['\u041d\u0435 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0430', '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0430'] as const
export const XRAY_HAND_PARAARTICULAR_OPTIONS = ['\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439', '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f'] as const
