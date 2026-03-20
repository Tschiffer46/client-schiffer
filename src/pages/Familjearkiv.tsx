import { useState, useEffect, useRef } from 'react'

// SHA-256 hash of the access password (never stored in plain text)
const PASSWORD_HASH = '53e6a0a50e5d6df3dc3da768746b3e7cf7669fd86b6677b91b31638fe972ceba'
const SESSION_KEY = 'familjearkiv_auth'

async function hashPassword(pwd: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(pwd)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Familjearkiv() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'arkiv' | 'plan'>('arkiv')
  const [arkivBlobUrl, setArkivBlobUrl] = useState<string | null>(null)
  const [planBlobUrl, setPlanBlobUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (!authed) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [authed])

  // Once authenticated, fetch the files and create blob URLs
  // This bypasses any X-Frame-Options headers on the server
  useEffect(() => {
    if (!authed) return

    fetch('/familjearkiv.html')
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: 'text/html' })
        setArkivBlobUrl(URL.createObjectURL(blob))
      })

    fetch('/familjearkiv-plan.md')
      .then(r => r.text())
      .then(md => {
        // Wrap plain markdown in a minimal styled HTML page
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem;
              color: #292524; line-height: 1.7; font-size: 15px; }
            h1 { font-size: 1.6rem; color: #1c1917; margin-top: 2rem; }
            h2 { font-size: 1.2rem; color: #1c1917; margin-top: 1.8rem; border-bottom: 1px solid #e7e5e4; padding-bottom: .4rem; }
            h3 { font-size: 1rem; color: #44403c; margin-top: 1.2rem; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            th, td { border: 1px solid #d6d3d1; padding: .5rem .75rem; text-align: left; }
            th { background: #f5f5f4; font-weight: 600; }
            code { background: #f5f5f4; padding: .1em .35em; border-radius: 3px; font-size: .88em; }
            pre { background: #f5f5f4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
            pre code { background: none; padding: 0; }
            blockquote { border-left: 3px solid #5B8DB8; margin: 0; padding-left: 1rem; color: #57534e; }
            a { color: #5B8DB8; }
            hr { border: none; border-top: 1px solid #e7e5e4; margin: 1.5rem 0; }
          </style>
          </head><body><pre style="white-space:pre-wrap;font-family:inherit">${md.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`
        const blob = new Blob([html], { type: 'text/html' })
        setPlanBlobUrl(URL.createObjectURL(blob))
      })

    return () => {
      if (arkivBlobUrl) URL.revokeObjectURL(arkivBlobUrl)
      if (planBlobUrl) URL.revokeObjectURL(planBlobUrl)
    }
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
    if (arkivBlobUrl) URL.revokeObjectURL(arkivBlobUrl)
    if (planBlobUrl) URL.revokeObjectURL(planBlobUrl)
    setArkivBlobUrl(null)
    setPlanBlobUrl(null)
  }

  if (authed) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Thin top bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 h-10 shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('arkiv')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'arkiv'
                  ? 'bg-[#5B8DB8] text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              Familjearkiv
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'plan'
                  ? 'bg-[#5B8DB8] text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              Forskningsplan
            </button>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/familjearkiv-plan.md"
              download="Familjearkiv-PLAN.md"
              className="text-xs text-stone-400 hover:text-[#5B8DB8] transition-colors"
            >
              ↓ Ladda ned plan
            </a>
            <button
              onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'arkiv' ? (
          arkivBlobUrl
            ? <iframe src={arkivBlobUrl} className="flex-1 w-full border-0" title="Interaktivt familjearkiv" />
            : <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">Laddar arkiv…</div>
        ) : (
          planBlobUrl
            ? <iframe src={planBlobUrl} className="flex-1 w-full border-0" title="Forskningsplan" />
            : <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">Laddar plan…</div>
        )}
      </div>
    )
  }

  // Password gate
  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#5B8DB8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-stone-800 text-center mb-1">
          Familjearkiv
        </h1>
        <p className="text-stone-500 text-sm text-center mb-8">
          Det här avsnittet är skyddat. Ange lösenordet för att komma åt
          familjehistorien och forskningsplanen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
              Lösenord
            </label>
            <input
              id="password"
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              className={`w-full px-4 py-3 rounded-lg border text-stone-800 text-sm
                placeholder:text-stone-300 bg-white outline-none transition-colors
                focus:ring-2 focus:ring-[#5B8DB8]/30
                ${error
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-stone-200 focus:border-[#5B8DB8]'
                }`}
              placeholder="Ange lösenord…"
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-xs text-red-500">Fel lösenord. Försök igen.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full bg-[#5B8DB8] text-white py-3 rounded-lg text-sm font-medium
              hover:bg-[#4a7aa3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifierar…' : 'Öppna arkivet'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-stone-300">
          Familjerna Schiffer · privat arkiv
        </p>
      </div>
    </div>
  )
}
