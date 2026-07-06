"use client";

import { useId, useState } from "react";
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

const typeStyles: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  family: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "#047857",
    label: "Familj",
  },
  history: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "#b45309",
    label: "Historia",
  },
  migration: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    dot: "#0369a1",
    label: "Migration",
  },
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
  const uid = useId();
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${uid}-year`}
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              År *
            </label>
            <input
              id={`${uid}-year`}
              required
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]"
              placeholder="1957"
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-type`}
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Typ
            </label>
            <select
              id={`${uid}-type`}
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px] bg-white"
            >
              <option value="family">Familj</option>
              <option value="history">Historia</option>
              <option value="migration">Migration</option>
            </select>
          </div>
        </div>
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
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id={`${uid}-major`}
            type="checkbox"
            checked={form.major}
            onChange={(e) =>
              setForm((p) => ({ ...p, major: e.target.checked }))
            }
            className="rounded border-stone-300 w-4 h-4"
          />
          <label htmlFor={`${uid}-major`} className="text-[15px] text-stone-700">
            Viktig händelse (markeras större)
          </label>
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
      <p className="text-[15px] text-stone-600 mb-5 max-w-2xl">
        Familjens händelser vävda samman med världshistorien — det som hände i
        världen förklarar ofta varför familjen flyttade, flydde eller
        skildes åt.
      </p>

      {/* Filters + add button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div
          role="group"
          aria-label="Filtrera händelser"
          className="flex flex-wrap gap-2"
        >
          {(["all", "family", "history", "migration"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                filter === f
                  ? "bg-accent text-white"
                  : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
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
        <div
          className="absolute left-3 sm:left-4 top-1 bottom-1 w-0.5 bg-stone-300 rounded-full"
          aria-hidden="true"
        />

        <ol className="space-y-4 list-none">
          {filtered.map((ev) => {
            const style = typeStyles[ev.type] || typeStyles.family;
            return (
              <li key={ev.id} className="relative">
                <div
                  className={`absolute -left-[1.45rem] sm:-left-[1.7rem] top-5 rounded-full ${
                    ev.major
                      ? "w-4 h-4 ring-4 ring-white -translate-x-[1.5px]"
                      : "w-3 h-3 ring-2 ring-white"
                  }`}
                  style={{ background: style.dot }}
                  aria-hidden="true"
                />

                <div
                  className={`group rounded-xl p-4 sm:p-5 transition-shadow hover:shadow-md ${
                    ev.major
                      ? "bg-white border border-stone-200 shadow-sm"
                      : ev.type === "history"
                        ? "bg-stone-50 border border-dashed border-stone-300"
                        : "bg-white border border-stone-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-accent">
                          {ev.year}
                        </span>
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <h3
                        className={`mb-1 text-ink ${
                          ev.major
                            ? "font-display text-lg font-semibold"
                            : "text-[15px] font-semibold"
                        }`}
                      >
                        {ev.title}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                    <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <EditButton onClick={() => setEditEvent(ev)} />
                      <DeleteButton onClick={() => setDeleteEvent(ev)} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {filtered.length === 0 && (
        <p className="text-[15px] text-stone-600 py-8 text-center">
          Inga händelser i den här kategorin ännu.
        </p>
      )}

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
