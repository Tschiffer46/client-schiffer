import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  countryColors,
  countryNames,
} from "@/components/familjearkiv/countries";

export const metadata: Metadata = { title: "Familjearkiv" };

const familySummary = `Familjen Schiffer har rötter i fyra länder och bär spår av 1900-talets stora historiska katastrofer — det första världskriget, den tyska ockupationen av Norge, och den ungerska revolutionen 1956.

Thomas far, Laszlo György Schiffer, föddes den 27 december 1933 i Pécs, Ungern. Hans farfar var schwab (dunauschwabiskt tyskt yrkesfolk) och vagnmakare. Laszlo deltog i 1956 års revolution, angavs och flydde den 13 januari 1957 via Jugoslavien till Sverige med Svenska Röda Korset.

Thomas mor, Åse Karin Weber, föddes i Trondheim 1944 som krigsbarn — dotter till en norsk kvinna och en tysk soldat vid namn Weber från Dresden som försvann i rysk fångenskap. Hon levde under stigmat "tysketøs" i efterkrigstidens Norge.

Mormor Åse Sand fick fyra barn med tre olika fäder: Åse Karin (med soldaten Weber), Leif Kristian och Georg (med Grinde), och Jarle (med brevbäraren Odd Strømsem). Laszlo och Åse Karin fick sönerna Lars Göran (1969) och Thomas (1972) och bosatte sig i Helsingborg-trakten.`;

// Persons whose stories bäst fångar familjens historia — visas som ingångar
// till släktträdet. Okända id:n ignoreras tyst om databasen ändras.
const featuredStoryIds = ["laszlo", "ase", "ase_sand"];

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform group-hover:translate-x-0.5"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default async function FamiljearkivOverview() {
  const [personCount, countries, generations, gapCount, photoCount] =
    await Promise.all([
      prisma.person.count(),
      prisma.person.groupBy({
        by: ["country"],
        where: { country: { not: "" } },
      }),
      prisma.person.groupBy({ by: ["generation"] }),
      prisma.researchGap.count(),
      prisma.photo.count(),
    ]);

  const featured = (
    await prisma.person.findMany({
      where: { id: { in: featuredStoryIds } },
    })
  ).sort(
    (a, b) => featuredStoryIds.indexOf(a.id) - featuredStoryIds.indexOf(b.id)
  );

  const stats = [
    { value: `${personCount}`, label: "Registrerade personer" },
    { value: `${generations.length}`, label: "Generationer" },
    { value: `${countries.length}`, label: "Länder" },
    { value: "9 077", label: "DNA-matchningar" },
    { value: "1873", label: "Äldsta födelseår" },
  ];

  const explore = [
    {
      href: "/familjearkiv/slakttrad",
      title: "Släktträdet",
      teaser: `${personCount} personer i ${generations.length} generationer — klicka på vem som helst och läs deras berättelse.`,
    },
    {
      href: "/familjearkiv/flyktvagen",
      title: "Flykten 1957",
      teaser:
        "Följ farfar Laszlos väg från Budapest till Malmö — tåghopp, gränsen till fots och ett flyktingläger vid Adriatiska havet.",
    },
    {
      href: "/familjearkiv/tidslinje",
      title: "Tidslinjen",
      teaser:
        "Över 150 år av familje- och världshistoria, sida vid sida — från 1873 till idag.",
    },
    {
      href: "/familjearkiv/att-utforska",
      title: "Olösta mysterier",
      teaser: `${gapCount} gåtor väntar fortfarande på svar. Kanske är det du som löser en av dem?`,
    },
    {
      href: "/familjearkiv/foton",
      title: "Fotoalbumet",
      teaser:
        photoCount > 0
          ? `${photoCount} foton ur familjens samlingar, taggade person för person.`
          : "Familjens fotoalbum växer — ladda upp och tagga gamla bilder.",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Story hook */}
      <section
        aria-label="Introduktion"
        className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-sm"
      >
        <h2 className="font-display text-2xl sm:text-[2rem] leading-snug font-semibold text-ink max-w-2xl mb-4">
          Fyra länder. Fem generationer. En familj.
        </h2>
        <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl mb-6">
          En farfar som kastade molotovcocktails mot sovjetiska stridsvagnar och
          flydde genom Europa. En mormor som föddes som krigsbarn i det
          ockuperade Norge. En tysk soldat som försvann spårlöst. Det här är
          deras historia — och din.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {Object.entries(countryColors).map(([code, color]) => (
            <span
              key={code}
              className="flex items-center gap-2 text-sm font-medium text-stone-700"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              {countryNames[code]}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Arkivet i siffror">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm"
            >
              <dd className="text-3xl font-semibold text-accent">{s.value}</dd>
              <dt className="text-sm text-stone-600 mt-1">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Explore cards */}
      <section aria-labelledby="utforska-rubrik">
        <h2
          id="utforska-rubrik"
          className="font-display text-2xl font-semibold text-ink mb-5"
        >
          Börja utforska
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {explore.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group bg-white rounded-2xl border border-stone-200 p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-accent/40"
            >
              <h3 className="font-display text-xl font-semibold text-ink mb-2 flex items-center justify-between gap-2">
                {e.title}
                <span className="text-accent">
                  <ArrowIcon />
                </span>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {e.teaser}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured stories */}
      {featured.length > 0 && (
        <section aria-labelledby="berattelser-rubrik">
          <h2
            id="berattelser-rubrik"
            className="font-display text-2xl font-semibold text-ink mb-5"
          >
            Berättelser ur arkivet
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col"
              >
                <h3 className="font-display text-lg font-semibold text-ink">
                  {p.nickname || p.name}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                  {p.role}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-4 flex-1">
                  {p.story}
                </p>
                <Link
                  href={`/familjearkiv/slakttrad?person=${p.id}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark mt-4"
                >
                  Läs hela berättelsen
                  <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Family history */}
      <section
        aria-labelledby="historia-rubrik"
        className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-sm"
      >
        <h2
          id="historia-rubrik"
          className="font-display text-2xl font-semibold text-ink mb-5"
        >
          Familjens historia
        </h2>
        <div className="text-base text-stone-700 leading-relaxed space-y-4 max-w-prose">
          {familySummary.split("\n\n").map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:text-accent first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85]"
                  : undefined
              }
            >
              {para}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
