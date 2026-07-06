"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddButton, DeleteButton } from "./crud-buttons";
import { PhotoUpload } from "./photo-upload";
import { DeleteConfirm } from "./delete-confirm";

interface Photo {
  id: string;
  filename: string;
  originalName: string;
  caption: string | null;
  labels: {
    id: string;
    person: { id: string; name: string; nickname: string | null };
  }[];
}

interface Person {
  id: string;
  name: string;
  nickname: string | null;
}

function photoAlt(photo: Photo) {
  if (photo.caption) return photo.caption;
  const names = photo.labels.map(
    (l) => l.person.nickname || l.person.name.split(" ")[0]
  );
  return names.length > 0 ? `Foto med ${names.join(", ")}` : "Familjefoto";
}

function Lightbox({
  photo,
  onClose,
}: {
  photo: Photo | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (photo && !el.open) el.showModal();
    if (!photo && el.open) el.close();
  }, [photo]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      aria-label={photo ? photoAlt(photo) : "Foto"}
      className="backdrop:bg-black/70 bg-transparent p-0 max-w-4xl w-[calc(100%-2rem)] m-auto"
    >
      {photo && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-end p-2 absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              aria-label="Stäng fotovisaren"
              className="bg-white/90 text-stone-700 hover:text-ink rounded-full p-2 shadow"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/uploads/photos/${photo.filename}`}
            alt={photoAlt(photo)}
            className="w-full max-h-[70vh] object-contain bg-stone-950"
          />
          <div className="p-4 sm:p-5">
            {photo.caption && (
              <p className="text-[15px] text-ink font-medium mb-1.5">
                {photo.caption}
              </p>
            )}
            {photo.labels.length > 0 && (
              <p className="text-sm text-stone-600">
                På bilden:{" "}
                {photo.labels
                  .map((l) => l.person.nickname || l.person.name)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

export function PhotosClient({
  photos,
  persons,
}: {
  photos: Photo[];
  persons: Person[];
}) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [deletePhoto, setDeletePhoto] = useState<Photo | null>(null);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  async function handleDelete() {
    if (!deletePhoto) return;
    await fetch(`/api/photos/${deletePhoto.id}`, { method: "DELETE" });
    setDeletePhoto(null);
    router.refresh();
  }

  if (photos.length === 0) {
    return (
      <div>
        <div className="text-center py-16 max-w-md mx-auto">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent-soft flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2c5f8a"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">
            Fotoalbumet väntar på sin första bild
          </h2>
          <p className="text-[15px] text-stone-600 mb-6">
            Gamla fotografier gör historien levande. Skanna eller fota av
            albumen, ladda upp och tagga vilka som syns på bilderna.
          </p>
          <AddButton
            onClick={() => setShowUpload(true)}
            label="Ladda upp första fotot"
          />
        </div>

        {showUpload && (
          <PhotoUpload
            open={showUpload}
            onClose={() => setShowUpload(false)}
            onUploaded={() => router.refresh()}
            persons={persons}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-[15px] text-stone-600">
          {photos.length} {photos.length === 1 ? "foto" : "foton"} — klicka på
          en bild för att se den i stort format.
        </p>
        <AddButton onClick={() => setShowUpload(true)} label="Ladda upp" />
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none">
        {photos.map((photo) => (
          <li
            key={photo.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md relative"
          >
            <button
              onClick={() => setViewPhoto(photo)}
              className="block w-full text-left"
              aria-label={`Visa ${photoAlt(photo)} i stort format`}
            >
              <div className="aspect-square bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/uploads/photos/${photo.filename}`}
                  alt={photoAlt(photo)}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                {photo.caption && (
                  <p className="text-sm text-ink font-medium mb-1 line-clamp-2">
                    {photo.caption}
                  </p>
                )}
                {photo.labels.length > 0 && (
                  <p className="flex flex-wrap gap-1">
                    {photo.labels.map((label) => (
                      <span
                        key={label.id}
                        className="text-xs bg-accent-soft text-accent-dark rounded-full px-2 py-0.5"
                      >
                        #
                        {label.person.nickname ||
                          label.person.name.split(" ")[0]}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </button>
            <div className="absolute top-2 right-2 bg-white/90 rounded-lg shadow">
              <DeleteButton onClick={() => setDeletePhoto(photo)} />
            </div>
          </li>
        ))}
      </ul>

      <Lightbox photo={viewPhoto} onClose={() => setViewPhoto(null)} />

      {showUpload && (
        <PhotoUpload
          open={showUpload}
          onClose={() => setShowUpload(false)}
          onUploaded={() => router.refresh()}
          persons={persons}
        />
      )}

      {deletePhoto && (
        <DeleteConfirm
          open={!!deletePhoto}
          onClose={() => setDeletePhoto(null)}
          onConfirm={handleDelete}
          itemName={deletePhoto.caption || deletePhoto.originalName}
        />
      )}
    </div>
  );
}
