"use client";

import { useState } from "react";
import { Modal } from "./modal";

interface PersonData {
  id?: string;
  name: string;
  nickname: string | null;
  born: string;
  died: string;
  role: string;
  country: string;
  generation: number;
  branch: string;
  story: string;
  sortOrder: number;
}

const branches = [
  { value: "father", label: "Faderns sida" },
  { value: "mother", label: "Moderns sida" },
  { value: "thomas", label: "Thomas generation" },
  { value: "in-law", label: "Ingift/partner" },
  { value: "cousins-no", label: "Norska kusiner" },
  { value: "children", label: "Barn" },
];

const countries = [
  { value: "", label: "Okänt" },
  { value: "se", label: "Sverige" },
  { value: "no", label: "Norge" },
  { value: "hu", label: "Ungern" },
  { value: "de", label: "Tyskland" },
];

export function PersonForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
}) {
  const [form, setForm] = useState<PersonData>({
    name: initial?.name || "",
    nickname: initial?.nickname || "",
    born: initial?.born || "",
    died: initial?.died || "",
    role: initial?.role || "",
    country: initial?.country || "",
    generation: initial?.generation || 4,
    branch: initial?.branch || "thomas",
    story: initial?.story || "",
    sortOrder: initial?.sortOrder || 0,
    ...initial,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  function set(field: keyof PersonData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Redigera person" : "Lägg till person"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Namn *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Smeknamn
            </label>
            <input
              value={form.nickname || ""}
              onChange={(e) => set("nickname", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              placeholder="t.ex. Lasse"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Född
            </label>
            <input
              value={form.born}
              onChange={(e) => set("born", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              placeholder="27 jul 1972, Linköping"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Död
            </label>
            <input
              value={form.died}
              onChange={(e) => set("died", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              placeholder="— eller datum"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Roll
          </label>
          <input
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            placeholder="t.ex. Far, Morbror, Kusin"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Land
            </label>
            <select
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            >
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Generation
            </label>
            <select
              value={form.generation}
              onChange={(e) => set("generation", parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            >
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Gren
            </label>
            <select
              value={form.branch}
              onChange={(e) => set("branch", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            >
              {branches.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Berättelse
          </label>
          <textarea
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            placeholder="Berätta om personen..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-dark"
          >
            {initial?.id ? "Spara" : "Lägg till"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
