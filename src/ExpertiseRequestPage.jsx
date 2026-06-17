import { useState, useRef, useEffect } from 'react'
import {
  ChevronRight,
  X,
  Upload,
  FileCheck,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const SPHERES = ['Телекоммуникации', 'Аэрокосмос', 'Госуслуги']

const FUNCTIONS_BY_SPHERE = {
  Телекоммуникации: [
    'Выдача лицензий на радиочастоты',
    'Регулирование тарифов операторов',
    'Контроль качества связи',
    'Сертификация оборудования',
  ],
  Аэрокосмос: [
    'Лицензирование космической деятельности',
    'Управление орбитальными слотами',
    'Сертификация воздушных судов',
    'Контроль использования воздушного пространства',
  ],
  Госуслуги: [
    'Регистрация юридических лиц',
    'Выдача разрешительных документов',
    'Предоставление социальных льгот',
    'Ведение государственных реестров',
  ],
}

const PROCESSES_BY_SPHERE = {
  Телекоммуникации: [
    'Выдача разрешений на строительство базовых станций',
    'Присвоение номерного ресурса операторам',
    'Регистрация абонентских устройств',
  ],
  Аэрокосмос: [
    'Выдача свидетельств пилота',
    'Регистрация воздушных судов',
    'Согласование полётных планов',
  ],
  Госуслуги: [
    'Выдача лицензий на медицинскую деятельность',
    'Регистрация актов гражданского состояния',
    'Постановка на учёт транспортных средств',
    'Оформление земельных участков в собственность',
  ],
}

const TARGET_EFFECTS = [
  'Сокращение срока оказания',
  'Исключение бумажных документов',
  'Исключение человеческого фактора (автоматическое решение AI/роботом)',
  'Межведомственная интеграция ИС',
]

const APPLICANT = {
  organ: 'Министерство цифрового развития, инноваций и аэрокосмической промышленности',
  department: 'Департамент трансформации госуслуг',
  name: 'Иванов И. И.',
  email: 'ivanov@gov.kz',
  phone: '+7 777 777-77-77',
}

// ─── Helper components ────────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-sm text-red-600" role="alert">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </p>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function ReadOnlyCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  )
}

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  }
  const icons = {
    success: <CheckCircle size={18} className="shrink-0 text-green-600" />,
    error: <AlertCircle size={18} className="shrink-0 text-red-600" />,
    info: <Info size={18} className="shrink-0 text-blue-600" />,
  }

  return (
    <div
      className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${styles[type]}`}
      role="alert"
      aria-live="assertive"
    >
      {icons[type]}
      <p className="text-sm leading-snug">{message}</p>
      <button onClick={onClose} className="ml-auto shrink-0 opacity-60 hover:opacity-100 focus-visible:outline-2" aria-label="Закрыть">
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full text-blue-600 hover:text-blue-900 focus-visible:outline-2"
        aria-label={`Убрать ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  )
}

// ─── Dropzone ─────────────────────────────────────────────────────────────────

function Dropzone({ label, file, onFile, onRemove, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSet(f)
  }

  function handleChange(e) {
    const f = e.target.files[0]
    if (f) validateAndSet(f)
  }

  function validateAndSet(f) {
    if (!f.name.endsWith('.bpmn')) {
      onFile(null, 'Допускается только файл с расширением .bpmn')
    } else {
      onFile(f, null)
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <FileCheck size={20} className="shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded text-gray-400 hover:text-red-500 focus-visible:outline-2"
            aria-label="Удалить файл"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragging
              ? 'border-blue-400 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
          }`}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label={`Загрузить файл: ${label}`}
        >
          <Upload size={24} className="mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Перетащите файл или{' '}
            <span className="text-blue-600 underline">выберите на компьютере</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">Только файлы .bpmn</p>
          <input
            ref={inputRef}
            type="file"
            accept=".bpmn"
            className="hidden"
            onChange={handleChange}
            aria-hidden="true"
          />
        </div>
      )}
      <FieldError message={error} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY_FORM = {
  sphere: '',
  functions: [],
  process: '',
  toBeTitle: '',
  effects: [],
  description: '',
  asIsFile: null,
  toBeFile: null,
}

const EMPTY_ERRORS = {
  sphere: '',
  functions: '',
  process: '',
  toBeTitle: '',
  effects: '',
  description: '',
  asIsFile: '',
  toBeFile: '',
}

export default function ExpertiseRequestPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [submitted, setSubmitted] = useState(false)
  const [requestNumber, setRequestNumber] = useState('')
  const [toast, setToast] = useState(null)
  const [sphereOpen, setSphereOpen] = useState(false)
  const [funcOpen, setFuncOpen] = useState(false)
  const [processSuggestions, setProcessSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const sphereRef = useRef(null)
  const funcRef = useRef(null)
  const suggestRef = useRef(null)

  // close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (sphereRef.current && !sphereRef.current.contains(e.target)) setSphereOpen(false)
      if (funcRef.current && !funcRef.current.contains(e.target)) setFuncOpen(false)
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function selectSphere(sphere) {
    setForm((f) => ({ ...f, sphere, functions: [], process: '' }))
    setErrors((e) => ({ ...e, sphere: '', functions: '', process: '' }))
    setSphereOpen(false)
  }

  function toggleFunction(fn) {
    setForm((f) => {
      const has = f.functions.includes(fn)
      return { ...f, functions: has ? f.functions.filter((x) => x !== fn) : [...f.functions, fn] }
    })
    setErrors((e) => ({ ...e, functions: '' }))
  }

  function removeFunction(fn) {
    setForm((f) => ({ ...f, functions: f.functions.filter((x) => x !== fn) }))
  }

  function toggleEffect(ef) {
    setForm((f) => {
      const has = f.effects.includes(ef)
      return { ...f, effects: has ? f.effects.filter((x) => x !== ef) : [...f.effects, ef] }
    })
    setErrors((e) => ({ ...e, effects: '' }))
  }

  function handleProcessInput(val) {
    set('process', val)
    if (form.sphere && val.length > 0) {
      const list = (PROCESSES_BY_SPHERE[form.sphere] || []).filter((p) =>
        p.toLowerCase().includes(val.toLowerCase()),
      )
      setProcessSuggestions(list)
      setShowSuggestions(list.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  function selectProcess(p) {
    set('process', p)
    setShowSuggestions(false)
  }

  function setFile(field, file, error) {
    setForm((f) => ({ ...f, [field]: file }))
    setErrors((e) => ({ ...e, [field]: error || '' }))
  }

  function validate(forSubmit) {
    const e = { ...EMPTY_ERRORS }
    let ok = true
    if (!form.sphere) { e.sphere = 'Выберите сферу деятельности'; ok = false }
    if (!form.functions.length) { e.functions = 'Выберите минимум одну государственную функцию'; ok = false }
    if (!form.process.trim()) { e.process = 'Укажите государственный кейс / процесс'; ok = false }
    if (!form.toBeTitle.trim()) { e.toBeTitle = 'Укажите название процесса в целевом состоянии'; ok = false }
    if (!form.effects.length) { e.effects = 'Выберите минимум один целевой эффект'; ok = false }
    if (!form.description.trim()) { e.description = 'Заполните описание изменений'; ok = false }
    if (forSubmit) {
      if (!form.asIsFile) { e.asIsFile = 'Прикрепите схему AS IS'; ok = false }
      if (!form.toBeFile) { e.toBeFile = 'Прикрепите схему TO BE'; ok = false }
    }
    setErrors(e)
    return ok
  }

  async function handleSaveDraft() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setToast({ type: 'info', message: 'Черновик успешно сохранён.' })
  }

  async function handleSubmit() {
    if (!validate(true)) {
      setToast({ type: 'error', message: 'Проверьте заполнение всех обязательных полей формы.' })
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    const num = `№${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setRequestNumber(num)
    setSubmitted(true)
    setToast({ type: 'success', message: `Заявка ${num} успешно отправлена на экспертизу.` })
  }

  function handleCancel() {
    setForm(EMPTY_FORM)
    setErrors(EMPTY_ERRORS)
    setSubmitted(false)
    setRequestNumber('')
    setToast({ type: 'info', message: 'Форма очищена.' })
  }

  const availableFunctions = FUNCTIONS_BY_SPHERE[form.sphere] || []

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            АРМ Сотрудника Госоргана
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500" aria-label="Хлебные крошки">
          <a href="#" className="hover:text-blue-600 hover:underline focus-visible:outline-2">Главная</a>
          <ChevronRight size={14} />
          <a href="#" className="hover:text-blue-600 hover:underline focus-visible:outline-2">Мои заявки</a>
          <ChevronRight size={14} />
          <span className="text-gray-900" aria-current="page">Создать заявку</span>
        </nav>

        {/* Title & status */}
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Подача заявки на экспертизу процесса (Реинжиниринг)
          </h1>
          <span
            className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
              submitted
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {submitted ? 'Отправлено' : 'Черновик'}
          </span>
        </div>

        {/* Lifecycle indicator */}
        <div className="mb-8 flex items-center gap-0 overflow-x-auto rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
          {['Черновик', 'Регистрация', 'Экспертиза', 'Решение'].map((stage, i) => (
            <div key={stage} className="flex items-center">
              {i > 0 && <ChevronRight size={16} className="mx-2 shrink-0 text-gray-300" />}
              <span
                className={`whitespace-nowrap text-sm font-medium ${
                  i === 0 ? 'text-blue-700' : 'text-gray-400'
                }`}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Applicant block */}
          <SectionCard title="Данные заявителя">
            <div className="grid gap-4 sm:grid-cols-3">
              <ReadOnlyCard label="Госорган" value={APPLICANT.organ} />
              <ReadOnlyCard label="Департамент" value={APPLICANT.department} />
              <ReadOnlyCard
                label="Сотрудник"
                value={APPLICANT.name}
                sub={`${APPLICANT.email} · ${APPLICANT.phone}`}
              />
            </div>
          </SectionCard>

          {/* Classification block */}
          <SectionCard title="Классификация и контекст">
            <div className="space-y-5">
              {/* Sphere */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Сфера деятельности <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={sphereRef}>
                  <button
                    type="button"
                    onClick={() => setSphereOpen((o) => !o)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      errors.sphere ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={sphereOpen}
                  >
                    <span className={form.sphere ? 'text-gray-900' : 'text-gray-400'}>
                      {form.sphere || 'Выберите сферу...'}
                    </span>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${sphereOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {sphereOpen && (
                    <ul
                      className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                      role="listbox"
                    >
                      {SPHERES.map((s) => (
                        <li
                          key={s}
                          role="option"
                          aria-selected={form.sphere === s}
                          onClick={() => selectSphere(s)}
                          className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                            form.sphere === s ? 'bg-blue-100 font-medium text-blue-800' : 'text-gray-800'
                          }`}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <FieldError message={errors.sphere} />
              </div>

              {/* Functions */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Государственная функция <span className="text-red-500">*</span>
                </label>
                {form.functions.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {form.functions.map((fn) => (
                      <Chip key={fn} label={fn} onRemove={() => removeFunction(fn)} />
                    ))}
                  </div>
                )}
                <div className="relative" ref={funcRef}>
                  <button
                    type="button"
                    onClick={() => form.sphere && setFuncOpen((o) => !o)}
                    disabled={!form.sphere}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      !form.sphere
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : errors.functions
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={funcOpen}
                    aria-disabled={!form.sphere}
                  >
                    <span className="text-gray-400">
                      {form.sphere ? 'Выберите функции...' : 'Сначала выберите сферу'}
                    </span>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${funcOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {funcOpen && (
                    <ul
                      className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                      role="listbox"
                      aria-multiselectable="true"
                    >
                      {availableFunctions.map((fn) => {
                        const selected = form.functions.includes(fn)
                        return (
                          <li
                            key={fn}
                            role="option"
                            aria-selected={selected}
                            onClick={() => toggleFunction(fn)}
                            className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                              selected ? 'bg-blue-50 font-medium text-blue-800' : 'text-gray-800'
                            }`}
                          >
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                              {selected && <span className="block h-2 w-2 rounded-sm bg-white" />}
                            </span>
                            {fn}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                <FieldError message={errors.functions} />
              </div>

              {/* Process */}
              <div>
                <label htmlFor="process" className="mb-1 block text-sm font-medium text-gray-700">
                  Государственный кейс / Процесс <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={suggestRef}>
                  <input
                    id="process"
                    type="text"
                    value={form.process}
                    onChange={(e) => handleProcessInput(e.target.value)}
                    onFocus={() => {
                      if (form.sphere && form.process) {
                        const list = (PROCESSES_BY_SPHERE[form.sphere] || []).filter((p) =>
                          p.toLowerCase().includes(form.process.toLowerCase()),
                        )
                        setProcessSuggestions(list)
                        setShowSuggestions(list.length > 0)
                      }
                    }}
                    placeholder="Введите или выберите процесс..."
                    disabled={!form.sphere}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      !form.sphere
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : errors.process
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                  />
                  {showSuggestions && (
                    <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                      {processSuggestions.map((p) => (
                        <li
                          key={p}
                          onClick={() => selectProcess(p)}
                          className="cursor-pointer px-4 py-2.5 text-sm text-gray-800 hover:bg-blue-50"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <FieldError message={errors.process} />
              </div>
            </div>
          </SectionCard>

          {/* Reengineering block */}
          <SectionCard title="Описание реинжиниринга">
            <div className="space-y-5">
              {/* TO BE title */}
              <div>
                <label htmlFor="toBeTitle" className="mb-1 block text-sm font-medium text-gray-700">
                  Название процесса в целевом состоянии (TO BE) <span className="text-red-500">*</span>
                </label>
                <input
                  id="toBeTitle"
                  type="text"
                  value={form.toBeTitle}
                  onChange={(e) => set('toBeTitle', e.target.value)}
                  placeholder="Введите название..."
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
                    errors.toBeTitle ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                />
                <FieldError message={errors.toBeTitle} />
              </div>

              {/* Effects */}
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700">
                  Целевые эффекты <span className="text-red-500">*</span>
                </legend>
                <div className="space-y-2">
                  {TARGET_EFFECTS.map((ef) => {
                    const checked = form.effects.includes(ef)
                    return (
                      <label
                        key={ef}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEffect(ef)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600 focus-visible:outline-2"
                        />
                        <span className="text-sm text-gray-800">{ef}</span>
                      </label>
                    )
                  })}
                </div>
                <FieldError message={errors.effects} />
              </fieldset>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                  Краткое описание изменений и сути реинжиниринга <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Опишите текущее состояние процесса, предлагаемые изменения и ожидаемый результат..."
                  className={`w-full resize-y rounded-lg border px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
                    errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                />
                <FieldError message={errors.description} />
              </div>
            </div>
          </SectionCard>

          {/* BPMN block */}
          <SectionCard title="BPMN-схемы процесса">
            <div className="grid gap-6 sm:grid-cols-2">
              <Dropzone
                label='Схема "КАК ЕСТЬ" (AS IS)'
                file={form.asIsFile}
                onFile={(f, err) => setFile('asIsFile', f, err)}
                onRemove={() => setFile('asIsFile', null, null)}
                error={errors.asIsFile}
              />
              <Dropzone
                label='Схема "КАК БУДЕТ" (TO BE)'
                file={form.toBeFile}
                onFile={(f, err) => setFile('toBeFile', f, err)}
                onRemove={() => setFile('toBeFile', null, null)}
                error={errors.toBeFile}
              />
            </div>
          </SectionCard>

          {/* Footer */}
          {submitted ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-green-300 bg-green-50 px-6 py-8 text-center shadow-sm">
              <CheckCircle size={40} className="text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-800">Заявка успешно отправлена</p>
                <p className="text-sm text-green-700">Регистрационный номер: <strong>{requestNumber}</strong></p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                Создать новую заявку
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-60"
              >
                {submitting ? 'Отправка...' : 'Отправить на экспертизу'}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-60"
              >
                {saving ? 'Сохранение...' : 'Сохранить черновик'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
