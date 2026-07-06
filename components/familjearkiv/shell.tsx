"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/familjearkiv", label: "Översikt" },
  { href: "/familjearkiv/slakttrad", label: "Släktträd" },
  { href: "/familjearkiv/tidslinje", label: "Tidslinje" },
  { href: "/familjearkiv/flyktvagen", label: "Flykten 1957" },
  { href: "/familjearkiv/att-utforska", label: "Mysterier" },
  { href: "/familjearkiv/foton", label: "Foton" },
];

export function FamiljearkivShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-2">
              Familjerna Schiffer · Privat arkiv
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink tracking-tight mb-2">
              Familjearkiv
            </h1>
            <p className="text-stone-600 text-base">
              Från Pécs till Sverige — en familjs resa genom historien
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 shrink-0 text-sm text-stone-600 hover:text-ink transition-colors mt-1 px-3 py-2 rounded-lg hover:bg-stone-900/5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logga ut
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav aria-label="Arkivets avdelningar" className="mb-10 -mx-4 px-4">
        <div className="flex gap-1 p-1 bg-stone-900/5 rounded-xl w-fit max-w-full overflow-x-auto">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  active
                    ? "bg-white text-ink shadow-sm"
                    : "text-stone-600 hover:text-ink hover:bg-white/50"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
