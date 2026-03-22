"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddButton, DeleteButton } from "./crud-buttons";
import { PhotoUpload } from "./photo-upload";
import { DeleteConfirm } from "./delete-confirm";

interface Photo {
  id: string;
  filename: string;
  originalName: string;
  caption: string | null;
  labels: { id: string; person: { id: string; name: string; nickname: string | null } }[];
}

interface Person {
  id: string;
  name: string;
  nickname: string | null;
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

  async function handleDelete() {
    if (!deletePhoto) return;
    await fetch(`/api/photos/${deletePhoto.id}`, { method: "DELETE" });
    setDeletePhoto(null);
    router.refresh();
  }

  if (photos.length === 0 && !showUpload) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <AddButton onClick={() => setShowUpload(true)} label="Ladda upp" />
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8a29e"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-700 mb-1">
            Inga foton ännu
          </h3>
          <p className="text-sm text-stone-500">
            Ladda upp familjefoton för att börja bygga fotoarkivet.
          </p>
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-stone-500">
          Familjefoton — klicka för att se detaljer
        </p>
        <AddButton onClick={() => setShowUpload(true)} label="Ladda upp" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white border border-stone-200 rounded-xl overflow-hidden group"
          >
            <div className="aspect-square bg-stone-100 relative">
              <img
                src={`/api/uploads/photos/${photo.filename}`}
                alt={photo.caption || photo.originalName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 hidden group-hover:block">
                <DeleteButton onClick={() => setDeletePhoto(photo)} />
              </div>
            </div>
            <div className="p-3">
              {photo.caption && (
                <p className="text-xs text-stone-700 font-medium mb-1">
                  {photo.caption}
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {photo.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5"
                  >
                    #{label.person.nickname || label.person.name.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

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
