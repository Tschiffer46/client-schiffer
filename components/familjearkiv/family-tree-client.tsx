"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AddButton, EditButton, DeleteButton } from "./crud-buttons";
import { PersonForm } from "./person-form";
import { DeleteConfirm } from "./delete-confirm";

interface Person {
  id: string;
  name: string;
  nickname: string | null;
  born: string;
  died: string;
  role: string;
  country: string;
  generation: number;
  branch: string;
  story: string;
  photoUrl: string | null;
}

interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: string;
}

const countryColors: Record<string, string> = {
  hu: "#dc2626",
  se: "#2563eb",
  no: "#1e3a5f",
  de: "#6b7280",
};

const countryNames: Record<string, string> = {
  hu: "Ungern",
  se: "Sverige",
  no: "Norge",
  de: "Tyskland",
};

const generationLabels: Record<number, string> = {
  1: "Generation 1 — Farfars föräldrar (~1800-talet)",
  2: "Generation 2 — Far- och morföräldrar",
  3: "Generation 3 — Föräldrar & morbrödrar",
  4: "Generation 4 — Thomas generation",
  5: "Generation 5 — Barn & barnbarn",
};

function CountryDot({ country }: { country: string }) {
  const color = countryColors[country];
  if (!color) return null;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

function PersonCard({
  person,
  isSelected,
  onClick,
  partner,
  partnerType,
}: {
  person: Person;
  isSelected: boolean;
  onClick: () => void;
  partner?: Person | null;
  partnerType?: string;
}) {
  const displayName = person.nickname || person.name;

  return (
    <div className="flex items-center gap-0">
      <button
        onClick={onClick}
        className={`text-left bg-white border rounded-xl p-4 min-w-[200px] max-w-[260px] transition-all hover:shadow-md hover:-translate-y-0.5 ${
          isSelected
            ? "border-accent ring-2 ring-accent/20 shadow-md"
            : "border-stone-200"
        } ${person.id === "thomas" ? "border-l-4 border-l-accent" : ""}`}
      >
        <div className="flex items-center gap-3 mb-1">
          {/* Photo circle */}
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-stone-400 text-xs font-bold">
                {displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-stone-800 leading-tight truncate">
                {displayName}
              </span>
              <CountryDot country={person.country} />
            </div>
            {person.nickname && (
              <div className="text-[10px] text-stone-400 truncate">
                {person.name}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-stone-400 mb-1">
          {person.born}
          {person.died && person.died !== "—" ? ` — ${person.died}` : ""}
        </div>
        <div className="text-xs font-medium text-accent uppercase tracking-wider">
          {person.role}
        </div>
      </button>

      {/* Partner connector + card */}
      {partner && (
        <>
          <div className="flex items-center mx-1">
            <div
              className={`w-8 border-t-2 ${
                partnerType === "ex-partner"
                  ? "border-dashed border-stone-300"
                  : "border-accent"
              }`}
            />
            {partnerType === "ex-partner" && (
              <span className="text-[9px] text-stone-400 bg-stone-100 rounded px-1 -ml-1 -mr-1">
                ex
              </span>
            )}
          </div>
          <button
            onClick={() => {}}
            className="text-left bg-white border border-stone-200 rounded-xl p-4 min-w-[180px] max-w-[240px] transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                <span className="text-stone-400 text-xs font-bold">
                  {(partner.nickname || partner.name).charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-stone-800 leading-tight truncate">
                    {partner.nickname || partner.name}
                  </span>
                  <CountryDot country={partner.country} />
                </div>
              </div>
            </div>
            <div className="text-xs text-stone-400 mb-1">
              {partner.born}
            </div>
            <div className="text-xs font-medium text-accent uppercase tracking-wider">
              {partner.role}
            </div>
          </button>
        </>
      )}
    </div>
  );
}

export function FamilyTreeClient({
  persons,
  relationships,
}: {
  persons: Person[];
  relationships: Relationship[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Person | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [deletePerson, setDeletePerson] = useState<Person | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSavePerson(data: any) {
    if (data.id) {
      await fetch(`/api/persons/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    router.refresh();
  }

  async function handleDeletePerson() {
    if (!deletePerson) return;
    await fetch(`/api/persons/${deletePerson.id}`, { method: "DELETE" });
    setDeletePerson(null);
    setSelected(null);
    router.refresh();
  }

  function handleSelect(p: Person) {
    setSelected((prev) => (prev?.id === p.id ? null : p));
    setTimeout(
      () =>
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
      50
    );
  }

  // Build partner lookup: for key persons, find their primary partner
  const partnerMap = new Map<string, { partner: Person; type: string }>();
  const pairedIds = new Set<string>();

  // Process partner relationships
  for (const rel of relationships) {
    if (rel.type === "partner" || rel.type === "ex-partner") {
      const from = persons.find((p) => p.id === rel.fromId);
      const to = persons.find((p) => p.id === rel.toId);
      if (from && to) {
        // Only pair if the "from" person is in main branches (not in-law)
        if (from.branch !== "in-law") {
          // If already has a current partner, skip ex-partners in the pair display
          const existing = partnerMap.get(from.id);
          if (!existing || (existing.type === "ex-partner" && rel.type === "partner")) {
            partnerMap.set(from.id, { partner: to, type: rel.type });
            pairedIds.add(to.id);
          }
        }
      }
    }
  }

  const generations = [1, 2, 3, 4, 5];

  // Get children for selected person
  const selectedChildren = selected
    ? relationships
        .filter((r) => r.type === "parent" && r.fromId === selected.id)
        .map((r) => persons.find((p) => p.id === r.toId))
        .filter(Boolean)
    : [];

  const selectedPartners = selected
    ? relationships
        .filter(
          (r) =>
            (r.type === "partner" || r.type === "ex-partner") &&
            (r.fromId === selected.id || r.toId === selected.id)
        )
        .map((r) => ({
          person: persons.find(
            (p) => p.id === (r.fromId === selected.id ? r.toId : r.fromId)
          ),
          type: r.type,
        }))
        .filter((p) => p.person)
    : [];

  const selectedParents = selected
    ? relationships
        .filter((r) => r.type === "parent" && r.toId === selected.id)
        .map((r) => persons.find((p) => p.id === r.fromId))
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-8">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {Object.entries(countryColors).map(([code, color]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
            {countryNames[code]}
          </span>
        ))}
        <span className="flex items-center gap-1.5 ml-4">
          <span className="w-6 border-t-2 border-accent" />
          Partner
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 border-t-2 border-dashed border-stone-300" />
          Ex-partner
        </span>
        </div>
        <AddButton onClick={() => setShowAddPerson(true)} label="Ny person" />
      </div>

      {generations.map((gen) => {
        const genPersons = persons.filter(
          (p) => p.generation === gen && !pairedIds.has(p.id)
        );
        if (genPersons.length === 0) return null;

        // Split gen 4 into Thomas generation and Norwegian cousins
        let groups: { label: string; people: Person[] }[];
        if (gen === 4) {
          const thomas = genPersons.filter(
            (p) => p.branch === "thomas" || p.branch === "in-law"
          );
          const cousins = genPersons.filter(
            (p) => p.branch === "cousins-no"
          );
          groups = [];
          if (thomas.length)
            groups.push({
              label: "Generation 4 — Thomas generation",
              people: thomas,
            });
          if (cousins.length)
            groups.push({
              label: "Generation 4 — Norska kusiner",
              people: cousins,
            });
        } else {
          groups = [
            {
              label: generationLabels[gen] || `Generation ${gen}`,
              people: genPersons,
            },
          ];
        }

        return groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-6 rounded-full bg-accent" />
              <h3 className="text-sm font-semibold text-stone-700 tracking-wide">
                {group.label}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {group.people.map((p) => {
                const pair = partnerMap.get(p.id);
                return (
                  <PersonCard
                    key={p.id}
                    person={p}
                    isSelected={selected?.id === p.id}
                    onClick={() => handleSelect(p)}
                    partner={pair?.partner}
                    partnerType={pair?.type}
                  />
                );
              })}
            </div>
          </div>
        ));
      })}

      {/* Detail panel */}
      {selected && (
        <div
          ref={detailRef}
          className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 animate-fade-in"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-800">
                {selected.nickname
                  ? `${selected.nickname} (${selected.name})`
                  : selected.name}
              </h3>
              <p className="text-sm text-accent font-medium">{selected.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <EditButton onClick={() => setEditPerson(selected)} />
              <DeleteButton onClick={() => setDeletePerson(selected)} />
              <button
              onClick={() => setSelected(null)}
              className="text-stone-400 hover:text-stone-600 p-1 ml-1"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm mb-5">
            <span className="text-stone-400 font-medium">Född</span>
            <span className="text-stone-700">{selected.born}</span>
            <span className="text-stone-400 font-medium">Död</span>
            <span className="text-stone-700">{selected.died}</span>
          </div>

          {/* Relations summary */}
          {(selectedPartners.length > 0 ||
            selectedParents.length > 0 ||
            selectedChildren.length > 0) && (
            <div className="border-t border-stone-100 pt-4 mb-4">
              <div className="flex flex-wrap gap-4 text-xs">
                {selectedParents.length > 0 && (
                  <div>
                    <span className="text-stone-400 font-medium">
                      Föräldrar:{" "}
                    </span>
                    <span className="text-stone-600">
                      {selectedParents
                        .map((p) => p!.nickname || p!.name)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {selectedPartners.length > 0 && (
                  <div>
                    <span className="text-stone-400 font-medium">
                      Partner:{" "}
                    </span>
                    <span className="text-stone-600">
                      {selectedPartners
                        .map(
                          (p) =>
                            `${p.person!.nickname || p.person!.name}${
                              p.type === "ex-partner" ? " (ex)" : ""
                            }`
                        )
                        .join(", ")}
                    </span>
                  </div>
                )}
                {selectedChildren.length > 0 && (
                  <div>
                    <span className="text-stone-400 font-medium">Barn: </span>
                    <span className="text-stone-600">
                      {selectedChildren
                        .map((c) => c!.nickname || c!.name)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selected.story && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {selected.story}
            </p>
          )}
        </div>
      )}

      {/* CRUD modals */}
      {showAddPerson && (
        <PersonForm
          open={showAddPerson}
          onClose={() => setShowAddPerson(false)}
          onSave={handleSavePerson}
        />
      )}

      {editPerson && (
        <PersonForm
          open={!!editPerson}
          onClose={() => setEditPerson(null)}
          onSave={handleSavePerson}
          initial={editPerson}
        />
      )}

      {deletePerson && (
        <DeleteConfirm
          open={!!deletePerson}
          onClose={() => setDeletePerson(null)}
          onConfirm={handleDeletePerson}
          itemName={deletePerson.nickname || deletePerson.name}
        />
      )}
    </div>
  );
}
