interface XRayStudyTemplatesModalProps {
  templateQuery: string
  filteredStudyTemplates: readonly string[]
  onTemplateQueryChange: (value: string) => void
  onClose: () => void
  onSelectTemplate: (template: string) => void
}

export function XRayStudyTemplatesModal({
  templateQuery,
  filteredStudyTemplates,
  onTemplateQueryChange,
  onClose,
  onSelectTemplate,
}: XRayStudyTemplatesModalProps) {
  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-templates-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Шаблоны исследований"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно шаблонов"
        >
          ×
        </button>

        <label className="xray-template-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43a1 1 0 0 0 1.41-1.41l-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            value={templateQuery}
            onChange={(event) => onTemplateQueryChange(event.target.value)}
            placeholder="Поиск исследования"
            autoFocus
          />
        </label>

        <div className="xray-template-grid">
          {filteredStudyTemplates.map((template) => (
            <button
              key={template}
              type="button"
              className="xray-template-chip"
              onClick={() => onSelectTemplate(template)}
            >
              {template}
            </button>
          ))}
        </div>

        {filteredStudyTemplates.length === 0 ? (
          <div className="empty-state">Ничего не найдено.</div>
        ) : null}
      </section>
    </div>
  )
}
