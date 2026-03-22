"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { EditButton, DeleteButton, AddButton } from "./crud-buttons";
import { DeleteConfirm } from "./delete-confirm";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  type: string;
  major: boolean;
  sortOrder: number;
}

const typeStyles: Record<string, { bg: string; text: string; label: string }> =
  {
    family: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Familj" },
    history: { bg: "bg-amber-50", text: "text-amber-700", label: "Historia" },
    migration: { bg: "bg-sky-50", text: "text-sky-700", label: "Migration" },
  };

function EventForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<TimelineEvent>) => void;
  initial?: Partial<TimelineEvent>;
}) {
  const [form, setForm] = useState({
    year: initial?.year || "",
    title: initial?.title || "",
    description: initial?.description || "",
    type: initial?.type || "family",
    major: initial?.major || false,
    sortOrder: initial?.sortOrder || 0,
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
      title={initial?.id ? "Redigera händelse" : "Lägg till händelse"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              År *
            </label>
            <input
              required
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
              placeholder="1957"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Typ
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            >
              <option value="family">Familj</option>
              <option value="history">Historia</option>
              <option value="migration">Migration</option>
            </select>
          </div>
        </div>
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
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.major}
            onChange={(e) =>
              setForm((p) => ({ ...p, major: e.target.checked }))
            }
            className="rounded border-stone-300"
          />
          <label className="text-sm text-stone-600">
            Viktig händelse (markeras större)
          </label>
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

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<
    "all" | "family" | "history" | "migration"
  >("all");
  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<TimelineEvent | null>(null);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  async function handleSave(data: Partial<TimelineEvent>) {
    if (data.id) {
      await fetch(`/api/timeline/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteEvent) return;
    await fetch(`/api/timeline/${deleteEvent.id}`, { method: "DELETE" });
    setDeleteEvent(null);
    router.refresh();
  }

  return (
    <div>
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "family", "history", "migration"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === f
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {f === "all" ? "Alla" : typeStyles[f]?.label || f}
            </button>
          ))}
        </div>
        <AddButton onClick={() => setShowAdd(true)} label="Ny händelse" />
      </div>

      {/* Timeline */}
      <div className="relative pl-8 sm:pl-10">
        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-blue-500 rounded-full" />

        <div className="space-y-4">
          {filtered.map((ev) => {
            const style = typeStyles[ev.type] || typeStyles.family;
            return (
              <div
                key={ev.id}
                className={`relative group ${
                  ev.type === "history" ? "opacity-85" : ""
                }`}
              >
                <div
                  className={`absolute -left-[1.35rem] sm:-left-[1.6rem] top-4 rounded-full border-2 border-accent ${
                    ev.major
                      ? "w-3.5 h-3.5 bg-accent"
                      : "w-3 h-3 bg-stone-50"
                  }`}
                />

                <div
                  className={`rounded-xl p-4 sm:p-5 transition-all hover:shadow-sm ${
                    ev.type === "history"
                      ? "bg-stone-50 border border-dashed border-stone-300"
                      : "bg-white border border-stone-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-accent">
                          {ev.year}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-semibold mb-1 ${
                          ev.major ? "text-stone-900" : "text-stone-700"
                        }`}
                      >
                        {ev.title}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                    <div className="hidden group-hover:flex gap-1 ml-2">
                      <EditButton onClick={() => setEditEvent(ev)} />
                      <DeleteButton onClick={() => setDeleteEvent(ev)} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <EventForm
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}

      {/* Edit modal */}
      {editEvent && (
        <EventForm
          open={!!editEvent}
          onClose={() => setEditEvent(null)}
          onSave={handleSave}
          initial={editEvent}
        />
      )}

      {/* Delete confirm */}
      {deleteEvent && (
        <DeleteConfirm
          open={!!deleteEvent}
          onClose={() => setDeleteEvent(null)}
          onConfirm={handleDelete}
          itemName={deleteEvent.title}
        />
      )}
    </div>
  );
}
