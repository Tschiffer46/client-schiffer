import { useState, useEffect, useRef } from 'react'
import {
  persons,
  timelineEvents,
  flightRoute,
  researchGaps,
  familySummary,
  stats,
  countryColors,
  generationLabels,
  type Person,
} from '../data/familjearkiv-data'

// --- Password gate ---
const PASSWORD_HASH = '53e6a0a50e5d6df3dc3da768746b3e7cf7669fd86b6677b91b31638fe972ceba'
const SESSION_KEY = 'familjearkiv_auth'

async function hashPassword(pwd: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// --- Country badge ---
function CountryDot({ country }: { country: string }) {
  const color = countryColors[country]
  if (!color) return null
  return <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
}

// --- Tabs ---
type Tab = 'overview' | 'tree' | 'timeline' | 'route' | 'gaps'
const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Översikt' },
  { id: 'tree', label: 'Släktträd' },
  { id: 'timeline', label: 'Tidslinje' },
  { id: 'route', label: 'Flyktvägen' },
  { id: 'gaps', label: 'Att utforska' },
]

// ============================================================
// OVERVIEW
// ============================================================
function Overview() {
  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-5 text-center">
            <div className="text-3xl font-bold text-[#5B8DB8]">{s.value}</div>
            <div className="text-xs text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Country legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {Object.entries(countryColors).map(([code, color]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {{ hu: 'Ungern', se: 'Sverige', no: 'Norge', de: 'Tyskland' }[code]}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Familjens historia</h2>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          {familySummary.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// FAMILY TREE
// ============================================================
function FamilyTree() {
  const [selected, setSelected] = useState<Person | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const generations = [1, 2, 3, 4, 5]

  function handleSelect(p: Person) {
    setSelected(prev => prev?.id === p.id ? null : p)
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {Object.entries(countryColors).map(([code, color]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {{ hu: 'Ungern', se: 'Sverige', no: 'Norge', de: 'Tyskland' }[code]}
          </span>
        ))}
      </div>

      {generations.map(gen => {
        const genPersons = persons.filter(p => p.generation === gen)
        if (genPersons.length === 0) return null

        // Split gen 4 into Thomas generation and Norwegian cousins
        let groups: { label: string; people: Person[] }[]
        if (gen === 4) {
          const thomas = genPersons.filter(p => p.branch === 'thomas' || p.branch === 'in-law')
          const cousins = genPersons.filter(p => p.branch === 'cousins-no')
          groups = []
          if (thomas.length) groups.push({ label: 'Generation 4 — Thomas generation', people: thomas })
          if (cousins.length) groups.push({ label: 'Generation 4 — Norska kusiner', people: cousins })
        } else {
          groups = [{ label: generationLabels[gen] || `Generation ${gen}`, people: genPersons }]
        }

        return groups.map(group => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-6 rounded-full bg-[#5B8DB8]" />
              <h3 className="text-sm font-semibold text-stone-700 tracking-wide">{group.label}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {group.people.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`text-left bg-white border rounded-xl p-4 min-w-[200px] max-w-[260px] transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    selected?.id === p.id
                      ? 'border-[#5B8DB8] ring-2 ring-[#5B8DB8]/20 shadow-md'
                      : 'border-stone-200'
                  } ${p.id === 'thomas' ? 'border-l-4 border-l-[#5B8DB8]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-stone-800 leading-tight">{p.name}</span>
                    <CountryDot country={p.country} />
                  </div>
                  <div className="text-xs text-stone-400 mb-1">{p.born}{p.died && p.died !== '—' ? ` — ${p.died}` : ''}</div>
                  <div className="text-xs font-medium text-[#5B8DB8] uppercase tracking-wider">{p.role}</div>
                </button>
              ))}
            </div>
          </div>
        ))
      })}

      {/* Detail panel */}
      {selected && (
        <div ref={detailRef} className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-800">{selected.name}</h3>
              <p className="text-sm text-[#5B8DB8] font-medium">{selected.role}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600 p-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm mb-5">
            <span className="text-stone-400 font-medium">Född</span>
            <span className="text-stone-700">{selected.born}</span>
            <span className="text-stone-400 font-medium">Död</span>
            <span className="text-stone-700">{selected.died}</span>
          </div>
          {selected.story && (
            <p className="text-sm text-stone-600 leading-relaxed">{selected.story}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// TIMELINE
// ============================================================
function Timeline() {
  const [filter, setFilter] = useState<'all' | 'family' | 'history' | 'migration'>('all')
  const filtered = filter === 'all' ? timelineEvents : timelineEvents.filter(e => e.type === filter)

  const typeStyles = {
    family: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Familj' },
    history: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Historia' },
    migration: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Migration' },
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', 'family', 'history', 'migration'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === f
                ? 'bg-[#5B8DB8] text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {f === 'all' ? 'Alla' : typeStyles[f].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-8 sm:pl-10">
        {/* Vertical line */}
        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-blue-500 rounded-full" />

        <div className="space-y-4">
          {filtered.map((ev, i) => {
            const style = typeStyles[ev.type]
            return (
              <div key={i} className={`relative ${ev.type === 'history' ? 'opacity-85' : ''}`}>
                {/* Dot */}
                <div className={`absolute -left-[1.35rem] sm:-left-[1.6rem] top-4 rounded-full border-2 border-[#5B8DB8] ${
                  ev.major ? 'w-3.5 h-3.5 bg-[#5B8DB8]' : 'w-3 h-3 bg-stone-50'
                }`} />

                <div className={`rounded-xl p-4 sm:p-5 transition-all hover:shadow-sm ${
                  ev.type === 'history' ? 'bg-stone-50 border border-dashed border-stone-300' : 'bg-white border border-stone-200'
                }`}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#5B8DB8]">{ev.year}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${ev.major ? 'text-stone-900' : 'text-stone-700'}`}>
                    {ev.title}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{ev.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// FLIGHT ROUTE
// ============================================================
function FlightRoute() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-500">Laszlo György Schiffers resa från Budapest till Sverige, januari–mars 1957</p>

      {/* Route steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {flightRoute.map((stop, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 relative">
            {/* Connector arrow on desktop */}
            {i < flightRoute.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-stone-300 text-lg z-10">&rarr;</div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: stop.color }}
              >
                {stop.number}
              </div>
              <span className="font-semibold text-sm text-stone-800">{stop.place}</span>
            </div>
            <p className="text-xs text-stone-500">{stop.detail}</p>
            {stop.date && <p className="text-xs text-[#5B8DB8] font-medium mt-1">{stop.date}</p>}
          </div>
        ))}
      </div>

      {/* Story card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 max-w-3xl">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Detaljer om flykten</h3>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          <p>Västgränsen mot Österrike var stängd efter att 250 000 ungrare redan flytt. Laszlo valde istället den sydliga vägen mot Jugoslavien tillsammans med två rumskamrater från arbetarhotellet.</p>
          <p>De hoppade på tåget vid Pest-stationen S:t Elisabeth. Vid varje station hoppade de av på "icke-perrongsidan" och stod på rälsen tills tåget rullade igen. Nära gränsen hoppade de av och gick till fots.</p>
          <p>Flyktinglägret Palitce/Gerovo var ett ombyggt tyskt koncentrationsläger med 1 200 ungerska flyktingar. Maten räckte precis för att inte svälta. USA betalade för mat men Tito stoppade pengarna i egen ficka, enligt Laszlo.</p>
          <p>Svenska Röda Korset valde ut 250 personer baserat på yrkesutbildning. Laszlo var en av dem.</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// RESEARCH GAPS
// ============================================================
function Gaps() {
  const priorityStyle = {
    high: { dot: 'bg-red-400', label: 'Hög prioritet' },
    medium: { dot: 'bg-amber-400', label: 'Medel' },
    low: { dot: 'bg-stone-300', label: 'Låg' },
  }

  return (
    <div>
      <p className="text-sm text-stone-500 mb-6">Kunskapsluckor och forskningsförslag — sorterade efter prioritet</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {researchGaps.map((gap, i) => {
          const prio = priorityStyle[gap.priority || 'low']
          return (
            <div key={i} className={`bg-white border rounded-xl p-5 ${
              gap.priority === 'high' ? 'border-red-200 border-l-4 border-l-red-400' : 'border-stone-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${prio.dot}`} />
                <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">{prio.label}</span>
              </div>
              <h4 className="text-sm font-semibold text-stone-800 mb-1.5">{gap.title}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">{gap.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Familjearkiv() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) setTimeout(() => inputRef.current?.focus(), 100)
  }, [authed])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const hash = await hashPassword(password)
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setPassword('')
    }
    setLoading(false)
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setPassword('')
    setError(false)
  }

  // --- Password gate ---
  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B8DB8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-stone-800 text-center mb-1">Familjearkiv</h1>
          <p className="text-stone-500 text-sm text-center mb-8">
            Det här avsnittet är skyddat. Ange lösenordet för att komma åt familjehistorien.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Lösenord</label>
              <input
                id="password"
                ref={inputRef}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                className={`w-full px-4 py-3 rounded-lg border text-stone-800 text-sm placeholder:text-stone-300 bg-white outline-none transition-colors focus:ring-2 focus:ring-[#5B8DB8]/30 ${
                  error ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-[#5B8DB8]'
                }`}
                placeholder="Ange lösenord..."
                autoComplete="current-password"
              />
              {error && <p className="mt-2 text-xs text-red-500">Fel lösenord. Försök igen.</p>}
            </div>
            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="w-full bg-[#5B8DB8] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#4a7aa3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifierar...' : 'Öppna arkivet'}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-stone-300">Familjerna Schiffer &middot; privat arkiv</p>
        </div>
      </div>
    )
  }

  // --- Authenticated view ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-1">Familjearkiv</h1>
            <p className="text-stone-500 text-sm">Från Pécs till Sverige — en familjs resa genom historien</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors mt-2"
          >
            Logga ut
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-8 p-1 bg-stone-100 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'tree' && <FamilyTree />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'route' && <FlightRoute />}
        {activeTab === 'gaps' && <Gaps />}
      </div>
    </div>
  )
}
