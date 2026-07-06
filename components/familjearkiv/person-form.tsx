"use client";

import { useId, useState } from "react";
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

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]";
const labelClass = "block text-sm font-medium text-stone-700 mb-1";

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
  const uid = useId();
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-name`} className={labelClass}>
              Namn *
            </label>
            <input
              id={`${uid}-name`}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-nickname`} className={labelClass}>
              Smeknamn
            </label>
            <input
              id={`${uid}-nickname`}
              value={form.nickname || ""}
              onChange={(e) => set("nickname", e.target.value)}
              className={inputClass}
              placeholder="t.ex. Lasse"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-born`} className={labelClass}>
              Född
            </label>
            <input
              id={`${uid}-born`}
              value={form.born}
              onChange={(e) => set("born", e.target.value)}
              className={inputClass}
              placeholder="27 jul 1972, Linköping"
            />
          </div>
          <div>
            <label htmlFor={`${uid}-died`} className={labelClass}>
              Död
            </label>
            <input
              id={`${uid}-died`}
              value={form.died}
              onChange={(e) => set("died", e.target.value)}
              className={inputClass}
              placeholder="— eller datum"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-role`} className={labelClass}>
            Roll
          </label>
          <input
            id={`${uid}-role`}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className={inputClass}
            placeholder="t.ex. Far, Morbror, Kusin"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor={`${uid}-country`} className={labelClass}>
              Land
            </label>
            <select
              id={`${uid}-country`}
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className={`${inputClass} bg-white`}
            >
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-generation`} className={labelClass}>
              Generation
            </label>
            <select
              id={`${uid}-generation`}
              value={form.generation}
              onChange={(e) => set("generation", parseInt(e.target.value))}
              className={`${inputClass} bg-white`}
            >
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-branch`} className={labelClass}>
              Gren
            </label>
            <select
              id={`${uid}-branch`}
              value={form.branch}
              onChange={(e) => set("branch", e.target.value)}
              className={`${inputClass} bg-white`}
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
          <label htmlFor={`${uid}-story`} className={labelClass}>
            Berättelse
          </label>
          <textarea
            id={`${uid}-story`}
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Berätta om personen..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-ink rounded-lg"
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
