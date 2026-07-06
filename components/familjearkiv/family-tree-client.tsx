"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddButton, EditButton, DeleteButton } from "./crud-buttons";
import { PersonForm } from "./person-form";
import { DeleteConfirm } from "./delete-confirm";
import { countryColors, countryNames } from "./countries";

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
    <>
      <span
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0 align-middle"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="sr-only">({countryNames[country]})</span>
    </>
  );
}

function Avatar({ person }: { person: Person }) {
  const displayName = person.nickname || person.name;
  return (
    <div className="w-11 h-11 rounded-full bg-accent-soft flex items-center justify-center shrink-0 border border-stone-200">
      {person.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photoUrl}
          alt=""
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="text-accent text-sm font-semibold" aria-hidden="true">
          {displayName.charAt(0)}
        </span>
      )}
    </div>
  );
}

function PersonCard({
  person,
  isSelected,
  onClick,
}: {
  person: Person;
  isSelected: boolean;
  onClick: () => void;
}) {
  const displayName = person.nickname || person.name;
  const lifespan = `${person.born}${
    person.died && person.died !== "—" ? ` — ${person.died}` : ""
  }`;

  return (
    <button
      onClick={onClick}
      aria-expanded={isSelected}
      aria-controls="person-detalj"
      className={`text-left bg-white border rounded-xl p-4 w-full sm:w-[230px] transition-all hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? "border-accent ring-2 ring-accent/25 shadow-md"
          : "border-stone-200 shadow-sm"
      } ${person.id === "thomas" ? "border-l-4 border-l-accent" : ""}`}
    >
      <div className="flex items-center gap-3 mb-1.5">
        <Avatar person={person} />
        <div className="min-w-0">
          <span className="block font-semibold text-[15px] text-ink leading-snug line-clamp-2">
            {displayName} <CountryDot country={person.country} />
          </span>
          {person.nickname && (
            <span className="block text-xs text-stone-600 truncate">
              {person.name}
            </span>
          )}
        </div>
      </div>
      <div className="text-[13px] text-stone-600 mb-1 line-clamp-2">
        {lifespan}
      </div>
      <div className="text-[11px] font-semibold text-accent uppercase tracking-wider line-clamp-2">
        {person.role}
      </div>
    </button>
  );
}

function PersonChip({
  person,
  suffix,
  onSelect,
}: {
  person: Person;
  suffix?: string;
  onSelect: (p: Person) => void;
}) {
  return (
    <button
      onClick={() => onSelect(person)}
      className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 hover:bg-accent-soft text-sm text-stone-700 hover:text-accent-dark px-3 py-1 transition-colors"
    >
      <CountryDot country={person.country} />
      {person.nickname || person.name}
      {suffix && <span className="text-stone-600">{suffix}</span>}
    </button>
  );
}

export function FamilyTreeClient({
  persons,
  relationships,
  initialSelectedId,
}: {
  persons: Person[];
  relationships: Relationship[];
  initialSelectedId?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Person | null>(
    () => persons.find((p) => p.id === initialSelectedId) || null
  );
  const detailRef = useRef<HTMLDivElement>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [deletePerson, setDeletePerson] = useState<Person | null>(null);

  useEffect(() => {
    if (!selected) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    detailRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }

  // Build partner lookup: for key persons, find their primary partner
  const partnerMap = new Map<string, { partner: Person; type: string }>();
  const pairedIds = new Set<string>();

  for (const rel of relationships) {
    if (rel.type === "partner" || rel.type === "ex-partner") {
      const from = persons.find((p) => p.id === rel.fromId);
      const to = persons.find((p) => p.id === rel.toId);
      if (from && to && from.branch !== "in-law") {
        const existing = partnerMap.get(from.id);
        if (
          !existing ||
          (existing.type === "ex-partner" && rel.type === "partner")
        ) {
          partnerMap.set(from.id, { partner: to, type: rel.type });
          pairedIds.add(to.id);
        }
      }
    }
  }

  const generations = [1, 2, 3, 4, 5];

  const selectedChildren = selected
    ? relationships
        .filter((r) => r.type === "parent" && r.fromId === selected.id)
        .map((r) => persons.find((p) => p.id === r.toId))
        .filter((p): p is Person => Boolean(p))
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
        .filter((p): p is { person: Person; type: string } => Boolean(p.person))
    : [];

  const selectedParents = selected
    ? relationships
        .filter((r) => r.type === "parent" && r.toId === selected.id)
        .map((r) => persons.find((p) => p.id === r.fromId))
        .filter((p): p is Person => Boolean(p))
    : [];

  const detailPanel = selected && (
    <div
      ref={detailRef}
      id="person-detalj"
      role="region"
      aria-label={`Detaljer om ${selected.nickname || selected.name}`}
      className="bg-white border border-accent/30 rounded-2xl p-6 sm:p-8 shadow-md animate-fade-in mt-4"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            {selected.nickname
              ? `${selected.nickname} (${selected.name})`
              : selected.name}
          </h3>
          <p className="text-sm text-accent font-semibold uppercase tracking-wide mt-1">
            {selected.role}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <EditButton onClick={() => setEditPerson(selected)} />
          <DeleteButton onClick={() => setDeletePerson(selected)} />
          <button
            onClick={() => setSelected(null)}
            aria-label="Stäng detaljer"
            className="text-stone-600 hover:text-ink p-2 ml-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[15px] mb-5">
        <dt className="text-stone-600 font-medium">Född</dt>
        <dd className="text-stone-800">{selected.born || "Okänt"}</dd>
        <dt className="text-stone-600 font-medium">Död</dt>
        <dd className="text-stone-800">{selected.died || "—"}</dd>
        {countryNames[selected.country] && (
          <>
            <dt className="text-stone-600 font-medium">Land</dt>
            <dd className="text-stone-800 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: countryColors[selected.country] }}
                aria-hidden="true"
              />
              {countryNames[selected.country]}
            </dd>
          </>
        )}
      </dl>

      {(selectedPartners.length > 0 ||
        selectedParents.length > 0 ||
        selectedChildren.length > 0) && (
        <div className="border-t border-stone-100 pt-4 mb-5 space-y-3">
          {selectedParents.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-600 font-medium w-20">
                Föräldrar
              </span>
              {selectedParents.map((p) => (
                <PersonChip key={p.id} person={p} onSelect={setSelected} />
              ))}
            </div>
          )}
          {selectedPartners.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-600 font-medium w-20">
                Partner
              </span>
              {selectedPartners.map((p) => (
                <PersonChip
                  key={p.person.id}
                  person={p.person}
                  suffix={p.type === "ex-partner" ? "(ex)" : undefined}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
          {selectedChildren.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-600 font-medium w-20">
                Barn
              </span>
              {selectedChildren.map((c) => (
                <PersonChip key={c.id} person={c} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>
      )}

      {selected.story && (
        <p className="text-[15px] text-stone-700 leading-relaxed max-w-prose">
          {selected.story}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Legend + add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul
          aria-label="Teckenförklaring"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-700"
        >
          {Object.entries(countryColors).map(([code, color]) => (
            <li key={code} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              {countryNames[code]}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-accent" aria-hidden="true" />
            Partner
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="w-6 border-t-2 border-dashed border-stone-400"
              aria-hidden="true"
            />
            Ex-partner
          </li>
        </ul>
        <AddButton onClick={() => setShowAddPerson(true)} label="Ny person" />
      </div>

      <p className="text-[15px] text-stone-600 -mt-6">
        Klicka på en person för att läsa deras berättelse — och hoppa vidare
        via föräldrar, partner och barn.
      </p>

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
          const cousins = genPersons.filter((p) => p.branch === "cousins-no");
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

        return groups.map((group) => {
          const containsSelected =
            selected &&
            group.people.some(
              (p) =>
                p.id === selected.id ||
                partnerMap.get(p.id)?.partner.id === selected.id
            );

          return (
            <section key={group.label} aria-label={group.label}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-1 h-6 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <h2 className="font-display text-lg font-semibold text-ink">
                  {group.label}
                </h2>
              </div>
              <ul className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 list-none">
                {group.people.map((p) => {
                  const pair = partnerMap.get(p.id);
                  return (
                    <li
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center"
                    >
                      <PersonCard
                        person={p}
                        isSelected={selected?.id === p.id}
                        onClick={() => handleSelect(p)}
                      />
                      {pair && (
                        <>
                          {/* Partner connector: vertical on mobile, horizontal on larger screens */}
                          <div
                            className="flex items-center justify-center sm:mx-0"
                            aria-hidden="true"
                          >
                            <div
                              className={`sm:hidden h-5 border-l-2 ml-8 ${
                                pair.type === "ex-partner"
                                  ? "border-dashed border-stone-400"
                                  : "border-accent"
                              }`}
                            />
                            <div
                              className={`hidden sm:flex items-center ${
                                pair.type === "ex-partner" ? "relative" : ""
                              }`}
                            >
                              <div
                                className={`w-6 border-t-2 ${
                                  pair.type === "ex-partner"
                                    ? "border-dashed border-stone-400"
                                    : "border-accent"
                                }`}
                              />
                            </div>
                            {pair.type === "ex-partner" && (
                              <span className="text-[10px] font-medium text-stone-600 bg-stone-100 rounded px-1 sm:-ml-4 -mt-0 sm:mt-0">
                                ex
                              </span>
                            )}
                          </div>
                          <PersonCard
                            person={pair.partner}
                            isSelected={selected?.id === pair.partner.id}
                            onClick={() => handleSelect(pair.partner)}
                          />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              {containsSelected && detailPanel}
            </section>
          );
        });
      })}

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
