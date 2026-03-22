"use client";

import { useState } from "react";
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

const priorityStyle: Record<string, { dot: string; label: string }> = {
  high: { dot: "bg-red-400", label: "Hög prioritet" },
  medium: { dot: "bg-amber-400", label: "Medel" },
  low: { dot: "bg-stone-300", label: "Låg" },
};

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
      title={initial?.id ? "Redigera forskningsområde" : "Lägg till forskningsområde"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Titel *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Beskrivning
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Prioritet
          </label>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({ ...p, priority: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
          >
            <option value="high">Hög</option>
            <option value="medium">Medel</option>
            <option value="low">Låg</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600"
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-stone-500">
          Kunskapsluckor och forskningsförslag — sorterade efter prioritet
        </p>
        <AddButton onClick={() => setShowAdd(true)} label="Nytt område" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sorted.map((gap) => {
          const prio = priorityStyle[gap.priority] || priorityStyle.low;
          return (
            <div
              key={gap.id}
              className={`bg-white border rounded-xl p-5 group ${
                gap.priority === "high"
                  ? "border-red-200 border-l-4 border-l-red-400"
                  : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${prio.dot}`} />
                    <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                      {prio.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-800 mb-1.5">
                    {gap.title}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
                <div className="hidden group-hover:flex gap-1 ml-2">
                  <EditButton onClick={() => setEditGap(gap)} />
                  <DeleteButton onClick={() => setDeleteGap(gap)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
