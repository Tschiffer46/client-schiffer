"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoggaIn() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      inputRef.current?.focus();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2c5f8a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink text-center mb-2">
          Familjearkiv
        </h1>
        <p className="text-stone-600 text-[15px] text-center mb-8">
          Här inne finns familjens historia — släktträdet, flykten 1957 och
          alla berättelser. Ange lösenordet för att öppna arkivet.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Lösenord
            </label>
            <div className="relative">
              <input
                id="password"
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                aria-invalid={error || undefined}
                aria-describedby={error ? "password-error" : undefined}
                className={`w-full px-4 py-3 pr-12 rounded-lg border text-ink text-[15px] placeholder:text-stone-500 bg-white transition-colors ${
                  error
                    ? "border-red-600"
                    : "border-stone-300 focus:border-accent"
                }`}
                placeholder="Ange lösenord..."
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Dölj lösenordet" : "Visa lösenordet"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-600 hover:text-ink rounded-md"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p
                id="password-error"
                role="alert"
                className="mt-2 text-sm text-red-700"
              >
                Fel lösenord. Försök igen.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full bg-accent text-white py-3 rounded-lg text-[15px] font-medium hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Verifierar..." : "Öppna arkivet"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-stone-600">
          Familjerna Schiffer &middot; privat arkiv
        </p>
      </div>
    </div>
  );
}
