import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-xl">
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
          Välkommen
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-stone-800 leading-tight mb-6">
          Familjerna
          <br />
          Schiffer
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed mb-8">
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

      <div className="mt-20 border-t border-stone-200 pt-16">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">
              Familjen
            </h2>
            <p className="text-stone-600">
              Åse, Lasse, Susanne och Elin — plus hundarna Pima, Lasse och
              Thomas.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">
              Hemort
            </h2>
            <p className="text-stone-600">
              Rydebäck och Helsingborg — längs Öresundskusten i Skåne.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">
              På den här sidan
            </h2>
            <p className="text-stone-600">
              <Link href="/om-oss" className="text-accent hover:underline">
                Om oss
              </Link>
              ,{" "}
              <Link href="/film" className="text-accent hover:underline">
                filmer
              </Link>{" "}
              och{" "}
              <Link href="/lankar" className="text-accent hover:underline">
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
