import { prisma } from "@/lib/prisma";

const countryColors: Record<string, string> = {
  hu: "#dc2626",
  se: "#2563eb",
  no: "#1e3a5f",
  de: "#6b7280",
};

const countryNames: Record<string, string> = {
  hu: "Ungern",
  se: "Sverige",
  no: "Norge",
  de: "Tyskland",
};

const familySummary = `Familjen Schiffer har rötter i fyra länder och bär spår av 1900-talets stora historiska katastrofer — det första världskriget, den tyska ockupationen av Norge, och den ungerska revolutionen 1956.

Thomas far, Laszlo György Schiffer, föddes den 27 december 1933 i Pécs, Ungern. Hans farfar var schwab (dunauschwabiskt tyskt yrkesfolk) och vagnmakare. Laszlo deltog i 1956 års revolution, angavs och flydde den 13 januari 1957 via Jugoslavien till Sverige med Svenska Röda Korset.

Thomas mor, Åse Karin Weber, föddes i Trondheim 1944 som krigsbarn — dotter till en norsk kvinna och en tysk soldat vid namn Weber från Dresden som försvann i rysk fångenskap. Hon levde under stigmat "tysketøs" i efterkrigstidens Norge.

Mormor Åse Sand fick fyra barn med tre olika fäder: Åse Karin (med soldaten Weber), Leif Kristian och Georg (med Grinde), och Jarle (med brevbäraren Odd Strømsem). Laszlo och Åse Karin fick sönerna Lars Göran (1969) och Thomas (1972) och bosatte sig i Helsingborg-trakten.`;

export default async function FamiljearkivOverview() {
  const personCount = await prisma.person.count();
  const countries = await prisma.person.groupBy({
    by: ["country"],
    where: { country: { not: "" } },
  });
  const generations = await prisma.person.groupBy({ by: ["generation"] });

  const stats = [
    { value: `${personCount}`, label: "Registrerade personer" },
    { value: `${generations.length}`, label: "Generationer" },
    { value: `${countries.length}`, label: "Länder" },
    { value: "9 077", label: "DNA-matchningar" },
    { value: "1873", label: "Äldsta födelseår" },
  ];

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-stone-200 p-5 text-center"
          >
            <div className="text-3xl font-bold text-accent">{s.value}</div>
            <div className="text-xs text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Country legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {Object.entries(countryColors).map(([code, color]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
            {countryNames[code]}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Familjens historia
        </h2>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          {familySummary.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
