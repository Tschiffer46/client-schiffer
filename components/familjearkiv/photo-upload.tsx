"use client";

import { useId, useRef, useState } from "react";
import { Modal } from "./modal";

interface Person {
  id: string;
  name: string;
  nickname: string | null;
}

export function PhotoUpload({
  open,
  onClose,
  onUploaded,
  persons,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
  persons: Person[];
}) {
  const uid = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<Set<string>>(
    new Set()
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }

  function togglePerson(id: string) {
    setSelectedPersons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    for (const id of selectedPersons) {
      formData.append("personIds", id);
    }

    await fetch("/api/photos", { method: "POST", body: formData });

    setFile(null);
    setPreview(null);
    setCaption("");
    setSelectedPersons(new Set());
    setUploading(false);
    onUploaded();
    onClose();
  }

  function handleClose() {
    setFile(null);
    setPreview(null);
    setCaption("");
    setSelectedPersons(new Set());
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Ladda upp foto">
      <form onSubmit={handleUpload} className="space-y-4">
        {/* File picker — a real button so it works with keyboard */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-accent/60 transition-colors"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Förhandsvisning av vald bild"
              className="max-h-48 mx-auto rounded-lg"
            />
          ) : (
            <span className="block">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#57534e"
                strokeWidth="1.5"
                className="mx-auto mb-2"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[15px] text-stone-600">
                Klicka för att välja bild
              </span>
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Caption */}
        <div>
          <label
            htmlFor={`${uid}-caption`}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Bildtext
          </label>
          <input
            id={`${uid}-caption`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-[15px]"
            placeholder="Beskriv bilden..."
          />
        </div>

        {/* Person labels */}
        <fieldset>
          <legend className="block text-sm font-medium text-stone-700 mb-2">
            Tagga personer
          </legend>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-300 rounded-lg p-2">
            {persons.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-stone-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPersons.has(p.id)}
                  onChange={() => togglePerson(p.id)}
                  className="rounded border-stone-300 w-4 h-4"
                />
                <span className="text-[15px] text-stone-700">
                  {p.nickname || p.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-ink rounded-lg"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={!file || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-dark disabled:opacity-40"
          >
            {uploading ? "Laddar upp..." : "Ladda upp"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
