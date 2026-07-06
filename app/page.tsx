import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-xl">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Välkommen
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight tracking-tight mb-6">
          Familjerna
          <br />
          Schiffer
        </h1>
        <p className="text-lg text-stone-700 leading-relaxed mb-8">
          Vi är två familjer som bor i södra Sverige, i västra Skåne — en i
          Rydebäck och en i Helsingborg.
        </p>
        <Link
          href="/om-oss"
          className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          Läs om oss &rarr;
        </Link>
      </div>

      {/* Family archive teaser */}
      <div className="mt-20 bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-sm">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
          Familjearkivet
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-3 max-w-lg">
          Vår historia sträcker sig genom fyra länder och fem generationer
        </h2>
        <p className="text-stone-700 leading-relaxed max-w-xl mb-6">
          Revolutionen i Ungern 1956, en flykt genom Europa, krigsbarn i Norge
          — och mysterier som ännu inte är lösta. I familjearkivet finns
          släktträdet, tidslinjen och alla berättelser samlade.
        </p>
        <Link
          href="/familjearkiv"
          className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Öppna familjearkivet &rarr;
        </Link>
      </div>

      <div className="mt-16 border-t border-stone-200 pt-16">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-600 mb-2">
              Familjen
            </h2>
            <p className="text-stone-700">
              Åse, Lasse, Susanne och Elin — plus hundarna Pima, Lasse och
              Thomas.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-600 mb-2">
              Hemort
            </h2>
            <p className="text-stone-700">
              Rydebäck och Helsingborg — längs Öresundskusten i Skåne.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-600 mb-2">
              På den här sidan
            </h2>
            <p className="text-stone-700">
              <Link href="/om-oss" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                Om oss
              </Link>
              ,{" "}
              <Link href="/film" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                filmer
              </Link>{" "}
              och{" "}
              <Link href="/lankar" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                länkar
              </Link>{" "}
              till andra sidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
