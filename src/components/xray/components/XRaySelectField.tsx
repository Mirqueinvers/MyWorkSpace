import type { XRaySelectFieldProps } from '../types'

export function XRaySelectField<T extends string | number>({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: XRaySelectFieldProps<T>) {
  return (
    <div className={`field xray-select-field${isOpen ? ' is-open' : ''}`}>
      <span>{label}</span>
      <button
        type="button"
        className="xray-select-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <span className="xray-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="xray-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={String(option)}
              type="button"
              className={`xray-select-option${option === value ? ' is-active' : ''}`}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
