const members = [
  {
    name: "Åse",
    role: "Pensionär",
    detail: "Mamma till Lasse & Thomas",
    location: "Helsingborg",
  },
  {
    name: "Lasse",
    role: "Supporttekniker",
    detail: "Gift med Susanne",
    location: "Rydebäck",
  },
  {
    name: "Susanne",
    role: "Delägare, serviceinrättning",
    detail: "Gift med Lasse",
    location: "Rydebäck",
  },
  {
    name: "Elin",
    role: "Studerar",
    detail: "Dotter till Lasse & Susanne",
    location: "Rydebäck",
  },
];

export default function OmOss() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-stone-800 mb-2">
        Om oss
      </h1>
      <p className="text-stone-500 mb-12">
        Familjerna Schiffer — fyra personer, två orter.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {members.map((m) => (
          <div
            key={m.name}
            className="border border-stone-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-semibold text-stone-800">
                {m.name}
              </h2>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-3 py-1">
                {m.location}
              </span>
            </div>
            <p className="text-accent text-sm font-medium mb-1">{m.role}</p>
            <p className="text-stone-500 text-sm">{m.detail}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 pt-12">
        <h2 className="text-xl font-semibold text-stone-800 mb-4">Husdjur</h2>
        <p className="text-stone-600">
          I familjen finns hundarna <strong>Pima</strong>,{" "}
          <strong>Lasse</strong> och <strong>Thomas</strong>.
        </p>
      </div>
    </div>
  );
}
