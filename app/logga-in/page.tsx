"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoggaIn() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/familjearkiv");
      router.refresh();
    } else {
      setError(true);
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5B8DB8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-800 text-center mb-1">
          Familjearkiv
        </h1>
        <p className="text-stone-500 text-sm text-center mb-8">
          Det här avsnittet är skyddat. Ange lösenordet för att komma åt
          familjehistorien.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5"
            >
              Lösenord
            </label>
            <input
              id="password"
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full px-4 py-3 rounded-lg border text-stone-800 text-sm placeholder:text-stone-300 bg-white outline-none transition-colors focus:ring-2 focus:ring-accent/30 ${
                error
                  ? "border-red-400 focus:border-red-400"
                  : "border-stone-200 focus:border-accent"
              }`}
              placeholder="Ange lösenord..."
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-xs text-red-500">
                Fel lösenord. Försök igen.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full bg-accent text-white py-3 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Verifierar..." : "Öppna arkivet"}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-stone-300">
          Familjerna Schiffer &middot; privat arkiv
        </p>
      </div>
    </div>
  );
}
