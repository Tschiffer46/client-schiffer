import { useState, useEffect, useRef, useMemo } from 'react'
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
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
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
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Vår familjs historia</h2>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          {familySummary.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PERSON CARD (small, tree-style)
// ============================================================
function PersonCard({ person, selected, onSelect, divorced }: {
  person: Person
  selected: boolean
  onSelect: (p: Person) => void
  divorced?: boolean
}) {
  const isThomas = person.id === 'thomas'
  const isLasse = person.id === 'lars'
  const highlight = isThomas || isLasse

  return (
    <button
      onClick={() => onSelect(person)}
      className={`text-left rounded-lg px-2.5 py-1.5 transition-all hover:shadow-md hover:-translate-y-0.5 min-w-0 w-full ${
        selected
          ? 'ring-2 ring-[#5B8DB8]/40 shadow-md bg-[#5B8DB8]/5 border-[#5B8DB8]'
          : divorced
            ? 'bg-white border-dashed border-stone-300'
            : 'bg-white border-stone-200'
      } border ${highlight ? 'border-l-[3px] border-l-[#5B8DB8]' : ''}`}
      title={person.name}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <CountryDot country={person.country} />
        <span className="font-semibold text-xs text-stone-800 truncate leading-tight">{person.name.split(' ').slice(0, 2).join(' ')}</span>
      </div>
      <div className="text-[10px] text-stone-400 truncate">{person.born.split(',')[0]}</div>
      <div className="text-[10px] font-medium text-[#5B8DB8] truncate">{person.role}</div>
    </button>
  )
}

// ============================================================
// PERSON TIMELINE (life events)
// ============================================================
function PersonTimeline({ person }: { person: Person }) {
  if (!person.events || person.events.length === 0) {
    return <p className="text-xs text-stone-400 italic mt-3">Inga livshändelser registrerade ännu.</p>
  }

  return (
    <div className="mt-4 relative pl-5">
      <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#5B8DB8] to-stone-200 rounded-full" />
      <div className="space-y-2.5">
        {person.events.map((ev, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-[#5B8DB8] border border-white" />
            <div className="text-[11px]">
              <span className="font-bold text-[#5B8DB8]">{ev.year}</span>
              <span className="text-stone-600 ml-1.5">{ev.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// FAMILY TREE — visual tree with connectors
// ============================================================
function FamilyTree() {
  const [selected, setSelected] = useState<Person | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  function handleSelect(p: Person) {
    setSelected(prev => prev?.id === p.id ? null : p)
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  // Group persons by generation
  const genGroups = useMemo(() => {
    const gens = [1, 2, 3, 4, 5]
    return gens.map(gen => {
      const genPersons = persons.filter(p => p.generation === gen)
      if (gen === 4) {
        const schiffer = genPersons.filter(p => p.branch === 'thomas' || (p.branch === 'in-law' && p.generation === 4))
        const cousins = genPersons.filter(p => p.branch === 'cousins-no')
        return { gen, groups: [
          { label: 'Bröderna Schiffer & partners', people: schiffer, sub: 'schiffer' },
          { label: 'Norska kusiner', people: cousins, sub: 'cousins' },
        ]}
      }
      return { gen, groups: [{ label: generationLabels[gen] || `Generation ${gen}`, people: genPersons, sub: 'all' }] }
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {Object.entries(countryColors).map(([code, color]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {{ hu: 'Ungern', se: 'Sverige', no: 'Norge', de: 'Tyskland' }[code]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0 border-t-2 border-dashed border-stone-300" />
          Skild
        </span>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {genGroups.map(({ gen, groups }) => (
          <div key={gen}>
            {groups.map(group => {
              if (group.people.length === 0) return null
              return (
                <div key={group.label} className="mb-4">
                  {/* Generation header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-0.5 h-5 rounded-full bg-[#5B8DB8]" />
                    <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{group.label}</h3>
                  </div>

                  {/* Connector line */}
                  <div className="relative">
                    {group.people.length > 1 && (
                      <div className="absolute top-0 left-4 right-4 h-0.5 bg-stone-200 rounded-full hidden sm:block" style={{ top: '-2px' }} />
                    )}
                    <div className={`grid gap-2 ${
                      group.people.length <= 3
                        ? 'grid-cols-2 sm:grid-cols-3'
                        : group.people.length <= 5
                          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                    }`}>
                      {group.people.map(p => (
                        <PersonCard
                          key={p.id}
                          person={p}
                          selected={selected?.id === p.id}
                          onSelect={handleSelect}
                          divorced={p.id === 'maria_j'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Vertical connector between generations */}
            {gen < 5 && (
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-4 bg-stone-200 rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel with timeline */}
      {selected && (
        <div ref={detailRef} className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-stone-800">{selected.name}</h3>
              <p className="text-sm text-[#5B8DB8] font-medium">{selected.role}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600 p-1">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm mb-3">
            <span className="text-stone-400 text-xs font-medium">Född</span>
            <span className="text-stone-700 text-xs">{selected.born}</span>
            {selected.died && selected.died !== '—' && (
              <>
                <span className="text-stone-400 text-xs font-medium">Död</span>
                <span className="text-stone-700 text-xs">{selected.died}</span>
              </>
            )}
          </div>
          {selected.story && (
            <p className="text-xs text-stone-600 leading-relaxed">{selected.story}</p>
          )}

          {/* Person timeline */}
          <PersonTimeline person={selected} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// TIMELINE (global family events)
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
        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-blue-500 rounded-full" />
        <div className="space-y-4">
          {filtered.map((ev, i) => {
            const style = typeStyles[ev.type]
            return (
              <div key={i} className={`relative ${ev.type === 'history' ? 'opacity-85' : ''}`}>
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
// EUROPE SVG MAP for Flight Route
// ============================================================
function EuropeMap() {
  const [hoveredStop, setHoveredStop] = useState<number | null>(null)

  // Map coordinates: we project lat/lng to SVG viewport
  // Europe roughly: lat 35-72, lng -10 to 40
  const mapW = 800
  const mapH = 500
  const minLat = 42, maxLat = 62, minLng = 8, maxLng = 25

  function project(lat: number, lng: number): [number, number] {
    const x = ((lng - minLng) / (maxLng - minLng)) * mapW
    const y = mapH - ((lat - minLat) / (maxLat - minLat)) * mapH
    return [x, y]
  }

  // Simplified Europe outline paths (key countries)
  const countryPaths = [
    // Hungary (simplified)
    { d: 'M420,280 L460,260 L510,265 L530,280 L520,310 L480,320 L440,310 Z', name: 'Ungern', fill: '#fef2f2' },
    // Sweden (simplified)
    { d: 'M300,30 L340,20 L370,40 L380,80 L370,120 L350,160 L330,200 L310,220 L280,210 L260,180 L250,140 L260,100 L270,60 Z', name: 'Sverige', fill: '#eff6ff' },
    // Norway (simplified)
    { d: 'M220,10 L300,30 L270,60 L260,100 L250,140 L240,160 L220,170 L200,140 L190,100 L200,60 L210,30 Z', name: 'Norge', fill: '#f0fdf4' },
    // Yugoslavia/Croatia region (simplified)
    { d: 'M380,320 L440,310 L480,320 L470,350 L440,370 L400,360 L380,340 Z', name: 'forna Jugoslavien', fill: '#faf5ff' },
    // Austria (simplified)
    { d: 'M340,260 L420,280 L420,300 L380,310 L340,300 L320,280 Z', name: 'Österrike', fill: '#fafaf9' },
    // Germany (simplified)
    { d: 'M240,200 L320,190 L340,260 L320,280 L280,290 L240,280 L220,240 L230,210 Z', name: 'Tyskland', fill: '#f5f5f4' },
  ]

  // Draw route
  const stopsWithCoords = flightRoute.filter(s => s.lat && s.lng)
  const routePoints = stopsWithCoords.map(s => project(s.lat!, s.lng!))

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 overflow-x-auto">
      <svg viewBox={`-20 -20 ${mapW + 40} ${mapH + 40}`} className="w-full max-w-3xl mx-auto" style={{ minWidth: 500 }}>
        {/* Background */}
        <rect x="-20" y="-20" width={mapW + 40} height={mapH + 40} fill="#f8fafc" rx="12" />

        {/* Country outlines */}
        {countryPaths.map((c, i) => (
          <path key={i} d={c.d} fill={c.fill} stroke="#d6d3d1" strokeWidth="1" opacity="0.7" />
        ))}

        {/* Route line */}
        {routePoints.length > 1 && (
          <polyline
            points={routePoints.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="#5B8DB8"
            strokeWidth="2.5"
            strokeDasharray="6,3"
            opacity="0.7"
          />
        )}

        {/* Route line arrows */}
        {routePoints.slice(0, -1).map(([x1, y1], i) => {
          const [x2, y2] = routePoints[i + 1]
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
          return (
            <polygon
              key={`arrow-${i}`}
              points="-4,-3 4,0 -4,3"
              fill="#5B8DB8"
              opacity="0.5"
              transform={`translate(${mx},${my}) rotate(${angle})`}
            />
          )
        })}

        {/* Stop dots */}
        {stopsWithCoords.map((stop, i) => {
          const [x, y] = project(stop.lat!, stop.lng!)
          const isHovered = hoveredStop === stop.number
          return (
            <g key={stop.number}
              onMouseEnter={() => setHoveredStop(stop.number)}
              onMouseLeave={() => setHoveredStop(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={isHovered ? 8 : 5} fill={stop.color} stroke="white" strokeWidth="2" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fontWeight="600" fill="#44403c">
                {stop.number}
              </text>
              {isHovered && (
                <g>
                  <rect x={x + 12} y={y - 20} width={Math.max(stop.place.length * 6.5, 80)} height="30" rx="4" fill="white" stroke="#d6d3d1" strokeWidth="0.5" />
                  <text x={x + 16} y={y - 6} fontSize="10" fontWeight="600" fill="#1c1917">{stop.place}</text>
                  <text x={x + 16} y={y + 5} fontSize="8" fill="#78716c">{stop.detail}</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================
// FLIGHT ROUTE
// ============================================================
function FlightRoute() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-500">Laszlo György Schiffers resa från Budapest till Sverige — och familjens väg genom Sydsverige</p>

      {/* SVG Map */}
      <EuropeMap />

      {/* Route steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {flightRoute.map((stop, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-lg p-3 relative">
            {i < flightRoute.length - 1 && (
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-stone-300 text-sm z-10">&rarr;</div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: stop.color }}
              >
                {stop.number}
              </div>
              <span className="font-semibold text-xs text-stone-800 truncate">{stop.place}</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate">{stop.detail}</p>
            {stop.date && <p className="text-[10px] text-[#5B8DB8] font-medium mt-0.5">{stop.date}</p>}
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

      {/* After Sweden card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 max-w-3xl">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Livet i Sverige</h3>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          <p>Efter tre år i Norrtälje flyttade Laszlo till Norrköping där han träffade vår mor Åse Karin. De flyttade sedan till Linköping där båda bröderna Schiffer föddes — Lasse 1969 och Thomas 1972.</p>
          <p>Hösten 1972 flyttade familjen till Helsingborg, området Dalhem, där de bodde i tre år. 1975 köpte de hus i Bjuv på Jordgubbsgatan 3 där familjen bodde tills föräldrarna skilde sig i mitten av 1980-talet. Vår far flyttade då tillbaka till Helsingborg.</p>
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
            <p className="text-stone-500 text-sm">Från Pécs till Sverige — bröderna Schiffers resa genom historien</p>
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
