import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import OmOss from './pages/OmOss'
import Film from './pages/Film'
import Lankar from './pages/Lankar'

function Nav() {
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Hem' },
    { to: '/om-oss', label: 'Om oss' },
    { to: '/film', label: 'Film' },
    { to: '/lankar', label: 'Länkar' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <NavLink to="/" className="text-base font-semibold tracking-tight text-stone-800">
          Familjerna Schiffer
        </NavLink>

        {/* Desktop */}
        <div className="hidden sm:flex gap-6">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-[#5B8DB8]' : 'text-stone-500 hover:text-stone-800'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden text-stone-600 p-1"
          onClick={() => setOpen(o => !o)}
          aria-label="Meny"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-stone-100 bg-white">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium border-b border-stone-100 transition-colors ${isActive ? 'text-[#5B8DB8]' : 'text-stone-600 hover:text-stone-900'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 mt-16 py-8 text-center text-sm text-stone-400">
      © {new Date().getFullYear()} Familjerna Schiffer
    </footer>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/om-oss" element={<OmOss />} />
            <Route path="/film" element={<Film />} />
            <Route path="/lankar" element={<Lankar />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}
