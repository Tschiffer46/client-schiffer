import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Flykten 1957" };

export default async function FlyktvagenPage() {
  const stops = await prisma.routeStop.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-3">
          Från Budapest till Malmö — tio stopp, tre månader
        </h2>
        <p className="text-base text-stone-700 leading-relaxed">
          Den 13 januari 1957 lämnade Laszlo György Schiffer Budapest, eftersökt
          av militären för sin roll i revolutionen. Så här såg vägen ut — steg
          för steg, från flykten i mörkret till det första jobbet i Sverige.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10 lg:items-start">
        {/* Route stepper */}
        <ol className="relative pl-2 list-none mb-10 lg:mb-0">
          <div
            className="absolute left-[1.35rem] top-3 bottom-3 w-0.5 bg-stone-300"
            aria-hidden="true"
          />
          {stops.map((stop) => (
            <li key={stop.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div
                className="relative z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-bold text-ink shrink-0 border-[3px]"
                style={{ borderColor: stop.color }}
                aria-hidden="true"
              >
                {stop.number}
              </div>
              <div className="pt-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-ink leading-snug">
                  <span className="sr-only">Stopp {stop.number}: </span>
                  {stop.place}
                </h3>
                <p className="text-sm text-stone-600 mt-0.5">{stop.detail}</p>
                {stop.date && (
                  <p className="text-sm text-accent font-medium mt-0.5">
                    {stop.date}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Story card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm lg:sticky lg:top-24">
          <h3 className="font-display text-xl font-semibold text-ink mb-4">
            Detaljer om flykten
          </h3>
          <div className="text-[15px] text-stone-700 leading-relaxed space-y-4">
            <p>
              Västgränsen mot Österrike var stängd — 250 000 ungrare hade redan
              flytt den vägen. Laszlo valde istället den sydliga vägen mot
              Jugoslavien, tillsammans med två rumskamrater från
              arbetarhotellet.
            </p>
            <blockquote className="border-l-[3px] border-accent pl-4 py-1 font-display text-[17px] text-ink italic">
              Vid varje station hoppade de av på &quot;icke-perrongsidan&quot;
              och stod gömda på rälsen tills tåget rullade igen. Nära gränsen
              hoppade de av för sista gången — och gick till fots över pusztan i
              mörkret.
            </blockquote>
            <p>
              Flyktinglägret Palitce/Gerovo var ett ombyggt tyskt
              koncentrationsläger med 1 200 ungerska flyktingar. Maten räckte
              precis för att inte svälta. USA betalade för mat, men enligt
              Laszlo stoppade Tito pengarna i egen ficka.
            </p>
            <p>
              Efter cirka sex veckor kom Svenska Röda Korset och valde ut 250
              personer baserat på yrkesutbildning. Laszlo var en av dem. Ett
              chartrat tåg tog gruppen genom Österrike och Tyskland — där
              Coca-Cola delades ut vid stationerna — till Malmö, dit han anlände
              i mars 1957.
            </p>
          </div>
          <div className="border-t border-stone-100 mt-6 pt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/familjearkiv/slakttrad?person=laszlo"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              Läs Laszlos hela berättelse →
            </Link>
            <Link
              href="/familjearkiv/tidslinje"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              Se händelserna i tidslinjen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
