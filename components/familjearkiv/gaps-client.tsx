"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { EditButton, DeleteButton, AddButton } from "./crud-buttons";
import { DeleteConfirm } from "./delete-confirm";

interface ResearchGap {
  id: string;
  title: string;
  description: string;
  priority: string;
}

const priorityStyle: Record<
  string,
  { badge: string; label: string }
> = {
  high: { badge: "bg-red-50 text-red-700", label: "Het ledtråd" },
  medium: { badge: "bg-amber-50 text-amber-800", label: "Spår finns" },
  low: { badge: "bg-stone-100 text-stone-700", label: "Kallt spår" },
};

function MagnifierIcon() {
  return (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GapForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ResearchGap>) => void;
  initial?: Partial<ResearchGap>;
}) {
  const uid = useId();
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    priority: initial?.priority || "medium",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...initial, ...form });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Redigera mysterium" : "Lägg till mysterium"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={`${uid}-title`}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Titel *
          </label>
          <input
            id={`${uid}-title`}
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]"
          />
        </div>
        <div>
          <label
            htmlFor={`${uid}-desc`}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Beskrivning
          </label>
          <textarea
            id={`${uid}-desc`}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]"
          />
        </div>
        <div>
          <label
            htmlFor={`${uid}-prio`}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Prioritet
          </label>
          <select
            id={`${uid}-prio`}
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({ ...p, priority: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px] bg-white"
          >
            <option value="high">Hög — het ledtråd</option>
            <option value="medium">Medel — spår finns</option>
            <option value="low">Låg — kallt spår</option>
          </select>
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

export function GapsClient({ gaps }: { gaps: ResearchGap[] }) {
  const router = useRouter();
  const [editGap, setEditGap] = useState<ResearchGap | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteGap, setDeleteGap] = useState<ResearchGap | null>(null);

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...gaps].sort(
    (a, b) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
  );

  async function handleSave(data: Partial<ResearchGap>) {
    if (data.id) {
      await fetch(`/api/research-gaps/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/research-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteGap) return;
    await fetch(`/api/research-gaps/${deleteGap.id}`, { method: "DELETE" });
    setDeleteGap(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-3">
            Olösta mysterier
          </h2>
          <p className="text-base text-stone-700 leading-relaxed">
            Varje familj bär på gåtor. Här är våra — {sorted.length} frågor som
            ännu saknar svar, med ledtrådar om var svaren kan finnas. Kanske är
            det du som löser nästa?
          </p>
        </div>
        <AddButton onClick={() => setShowAdd(true)} label="Nytt mysterium" />
      </div>

      <ul className="grid sm:grid-cols-2 gap-4 list-none">
        {sorted.map((gap) => {
          const prio = priorityStyle[gap.priority] || priorityStyle.low;
          return (
            <li
              key={gap.id}
              className={`group bg-white border rounded-2xl p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md ${
                gap.priority === "high"
                  ? "border-red-200 border-l-4 border-l-red-600"
                  : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-accent" aria-hidden="true">
                      <MagnifierIcon />
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${prio.badge}`}
                    >
                      {prio.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-1.5">
                    {gap.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
                <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <EditButton onClick={() => setEditGap(gap)} />
                  <DeleteButton onClick={() => setDeleteGap(gap)} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {showAdd && (
        <GapForm
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}

      {editGap && (
        <GapForm
          open={!!editGap}
          onClose={() => setEditGap(null)}
          onSave={handleSave}
          initial={editGap}
        />
      )}

      {deleteGap && (
        <DeleteConfirm
          open={!!deleteGap}
          onClose={() => setDeleteGap(null)}
          onConfirm={handleDelete}
          itemName={deleteGap.title}
        />
      )}
    </div>
  );
}
