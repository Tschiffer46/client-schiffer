"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Hem" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/film", label: "Film" },
  { href: "/lankar", label: "Länkar" },
  { href: "/familjearkiv", label: "Familjearkiv" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-stone-800"
        >
          Familjerna Schiffer
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex gap-6 items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                l.href === "/familjearkiv"
                  ? "flex items-center gap-1"
                  : ""
              } ${
                isActive(l.href)
                  ? "text-accent"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {l.href === "/familjearkiv" && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden text-stone-600 p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label="Meny"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path
                d="M4 4L18 18M18 4L4 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-stone-100 bg-white">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm font-medium border-b border-stone-100 transition-colors ${
                isActive(l.href)
                  ? "text-accent"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {l.href === "/familjearkiv" ? "\u{1F512} " : ""}
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
