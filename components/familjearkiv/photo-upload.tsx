"use client";

import { useState, useRef } from "react";
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
        {/* File input */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
          ) : (
            <div>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8a29e"
                strokeWidth="1.5"
                className="mx-auto mb-2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm text-stone-500">
                Klicka för att välja bild
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Bildtext
          </label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
            placeholder="Beskriv bilden..."
          />
        </div>

        {/* Person labels */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-2">
            Tagga personer
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-200 rounded-lg p-2">
            {persons.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-stone-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPersons.has(p.id)}
                  onChange={() => togglePerson(p.id)}
                  className="rounded border-stone-300 text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-stone-700">
                  {p.nickname || p.name}
                </span>
                <span className="text-[10px] text-stone-400">
                  #{(p.nickname || p.name).replace(/\s+/g, "")}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
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
