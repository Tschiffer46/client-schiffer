"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/familjearkiv", label: "Översikt" },
  { href: "/familjearkiv/slakttrad", label: "Släktträd" },
  { href: "/familjearkiv/tidslinje", label: "Tidslinje" },
  { href: "/familjearkiv/flyktvagen", label: "Flyktvägen" },
  { href: "/familjearkiv/att-utforska", label: "Att utforska" },
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
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-1">
              Familjearkiv
            </h1>
            <p className="text-stone-500 text-sm">
              Från Pécs till Sverige — en familjs resa genom historien
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors mt-2"
          >
            Logga ut
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-8 p-1 bg-stone-100 rounded-xl w-fit">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              pathname === t.href
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
