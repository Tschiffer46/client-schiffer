const links = [
  {
    title: 'Havstornet',
    url: 'https://seatower.schiffer.se',
    description: 'Hemsidan för Brf Havstornet i Rydebäck — vår byggnad vid stationen med utsikt mot sundet.',
  },
  {
    title: 'Diabetesförbundet',
    url: 'https://www.diabetes.se',
    description: 'Svenska Diabetesförbundet — intresseorganisation för personer med diabetes.',
  },
  {
    title: 'Pimas hemsida',
    url: 'http://pima.schiffer.se',
    description: 'Hemsidan om vår labrador Pima — bilder, fakta och annat roligt.',
  },
]

export default function Lankar() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-stone-800 mb-2">Länkar</h1>
      <p className="text-stone-500 mb-12">Sidor som hör till oss eller som vi vill lyfta fram.</p>

      <div className="flex flex-col gap-4">
        {links.map(l => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-stone-200 rounded-xl p-6 bg-white hover:border-[#5B8DB8] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-stone-800 group-hover:text-[#5B8DB8] transition-colors">
                {l.title}
              </h2>
              <span className="text-stone-400 group-hover:text-[#5B8DB8] transition-colors text-lg">↗</span>
            </div>
            <p className="text-stone-500 text-sm">{l.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
