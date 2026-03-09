import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="max-w-xl">
        <p className="text-[#5B8DB8] text-sm font-medium tracking-widest uppercase mb-4">
          Välkommen
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-stone-800 leading-tight mb-6">
          Familjerna<br />Schiffer
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed mb-8">
          Vi är två familjer som bor i södra Sverige, i västra Skåne —
          en i Rydebäck och en i Helsingborg.
        </p>
        <Link
          to="/om-oss"
          className="inline-block bg-[#5B8DB8] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#4a7aa3] transition-colors"
        >
          Läs om oss →
        </Link>
      </div>

      {/* Divider */}
      <div className="mt-20 border-t border-stone-200 pt-16">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Familjen</h2>
            <p className="text-stone-600">Åse, Lasse, Susanne och Elin — plus hundarna Pima, Lasse och Thomas.</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Hemort</h2>
            <p className="text-stone-600">Rydebäck och Helsingborg — längs Öresundskusten i Skåne.</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">På den här sidan</h2>
            <p className="text-stone-600">
              <Link to="/om-oss" className="text-[#5B8DB8] hover:underline">Om oss</Link>,{' '}
              <Link to="/film" className="text-[#5B8DB8] hover:underline">filmer</Link> och{' '}
              <Link to="/lankar" className="text-[#5B8DB8] hover:underline">länkar</Link> till andra sidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
