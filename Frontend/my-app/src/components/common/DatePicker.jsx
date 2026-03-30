import { useMemo, useState } from 'react'
import '../../styles/DatePicker.css'

const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
const DOWS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function parseIsoDate(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isBeforeIsoDate(left, right) {
  const a = parseIsoDate(left)
  const b = parseIsoDate(right)
  if (!a || !b) return false
  return a.getTime() < b.getTime()
}

function formatDisplayDate(value) {
  return value ? value.split('-').reverse().join('/') : ''
}

function CalendarPanel({ value, onChange, onClose, minDate, maxDate, theme }) {
  const today = new Date()
  const initial = parseIsoDate(value) ?? parseIsoDate(minDate) ?? parseIsoDate(maxDate) ?? today
  const [year, setYear] = useState(initial.getFullYear())
  const [month, setMonth] = useState(initial.getMonth())
  const currentYear = today.getFullYear()
  const years = useMemo(() => Array.from({ length: 121 }, (_, idx) => currentYear - 100 + idx), [currentYear])
  const minDateObj = parseIsoDate(minDate)
  const maxDateObj = parseIsoDate(maxDate)
  const selected = parseIsoDate(value)
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const pad = cells.length % 7 ? 7 - (cells.length % 7) : 0
  for (let i = 0; i < pad; i++) cells.push(null)

  function moveMonth(delta) {
    if (month + delta < 0) {
      setMonth(11)
      setYear(y => y - 1)
      return
    }
    if (month + delta > 11) {
      setMonth(0)
      setYear(y => y + 1)
      return
    }
    setMonth(m => m + delta)
  }

  function pick(day) {
    if (!day) return
    const picked = new Date(year, month, day)
    if ((minDateObj && picked < minDateObj) || (maxDateObj && picked > maxDateObj)) return
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(iso)
    onClose()
  }

  function cellClass(day) {
    if (!day) return 'ui-cal__day ui-cal__day--empty'
    const current = new Date(year, month, day)
    const isDisabled = (minDateObj && current < minDateObj) || (maxDateObj && current > maxDateObj)
    const isToday = current.getTime() === todayOnly.getTime()
    const isSelected = selected && current.getTime() === selected.getTime()
    return [
      'ui-cal__day',
      isDisabled && 'ui-cal__day--disabled',
      isToday && 'ui-cal__day--today',
      isSelected && 'ui-cal__day--selected',
    ].filter(Boolean).join(' ')
  }

  return (
    <div className={`ui-cal ui-cal--${theme}`} onClick={e => e.stopPropagation()}>
      <div className="ui-cal__nav">
        <button type="button" className="ui-cal__nav-btn" onClick={() => moveMonth(-1)}>‹</button>
        <div className="ui-cal__selects">
          <select className="ui-cal__select" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((label, index) => (
              <option key={label} value={index}>{label}</option>
            ))}
          </select>
          <select className="ui-cal__select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <button type="button" className="ui-cal__nav-btn" onClick={() => moveMonth(1)}>›</button>
      </div>
      <div className="ui-cal__grid ui-cal__grid--dow">
        {DOWS.map(day => <div key={day} className="ui-cal__dow">{day}</div>)}
      </div>
      <div className="ui-cal__grid">
        {cells.map((day, index) => (
          <button
            key={`${day ?? 'e'}-${index}`}
            type="button"
            className={cellClass(day)}
            onClick={() => pick(day)}
            disabled={!day}
          >
            {day || ''}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DatePicker({
  label,
  value,
  onChange,
  onClose,
  minDate,
  maxDate,
  placeholder = 'Chọn ngày',
  theme = 'light',
  className = '',
  triggerClassName = '',
  style,
  triggerStyle,
}) {
  const [open, setOpen] = useState(false)
  const display = formatDisplayDate(value)

  return (
    <div className={`ui-date ui-date--${theme} ${className}`.trim()} style={style}>
      {label ? <label className="ui-date__label">{label}</label> : null}
      <button
        type="button"
        className={`ui-date__trigger ${triggerClassName}`.trim()}
        style={triggerStyle}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="ui-date__icon">📅</span>
        <span className={`ui-date__text${display ? '' : ' is-placeholder'}`}>{display || placeholder}</span>
      </button>
      {open && (
        <>
          <div className="ui-date__overlay" onClick={() => { setOpen(false); onClose?.() }} />
          <CalendarPanel
            value={value}
            onChange={nextValue => onChange?.(nextValue)}
            onClose={() => { setOpen(false); onClose?.() }}
            minDate={minDate}
            maxDate={maxDate}
            theme={theme}
          />
        </>
      )}
    </div>
  )
}
