import { prisma } from "@/lib/prisma";

export default async function FlyktvagenPage() {
  const stops = await prisma.routeStop.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-500">
        Laszlo György Schiffers resa från Budapest till Sverige, januari–mars
        1957
      </p>

      {/* Route steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stops.map((stop, i) => (
          <div
            key={stop.id}
            className="bg-white border border-stone-200 rounded-xl p-4 relative"
          >
            {i < stops.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-stone-300 text-lg z-10">
                &rarr;
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: stop.color }}
              >
                {stop.number}
              </div>
              <span className="font-semibold text-sm text-stone-800">
                {stop.place}
              </span>
            </div>
            <p className="text-xs text-stone-500">{stop.detail}</p>
            {stop.date && (
              <p className="text-xs text-accent font-medium mt-1">
                {stop.date}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Story card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 max-w-3xl">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          Detaljer om flykten
        </h3>
        <div className="text-sm text-stone-600 leading-relaxed space-y-3">
          <p>
            Västgränsen mot Österrike var stängd efter att 250 000 ungrare redan
            flytt. Laszlo valde istället den sydliga vägen mot Jugoslavien
            tillsammans med två rumskamrater från arbetarhotellet.
          </p>
          <p>
            De hoppade på tåget vid Pest-stationen S:t Elisabeth. Vid varje
            station hoppade de av på &quot;icke-perrongsidan&quot; och stod på
            rälsen tills tåget rullade igen. Nära gränsen hoppade de av och gick
            till fots.
          </p>
          <p>
            Flyktinglägret Palitce/Gerovo var ett ombyggt tyskt
            koncentrationsläger med 1 200 ungerska flyktingar. Maten räckte
            precis för att inte svälta. USA betalade för mat men Tito stoppade
            pengarna i egen ficka, enligt Laszlo.
          </p>
          <p>
            Svenska Röda Korset valde ut 250 personer baserat på
            yrkesutbildning. Laszlo var en av dem.
          </p>
        </div>
      </div>
    </div>
  );
}
