"use client";

import { useState } from "react";
import { Modal } from "./modal";

export function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  itemName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");

  function handleClose() {
    setStep(1);
    setConfirmText("");
    onClose();
  }

  function handleFirstConfirm() {
    setStep(2);
  }

  function handleFinalConfirm() {
    if (confirmText === "RADERA") {
      onConfirm();
      handleClose();
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bekräfta radering">
      {step === 1 ? (
        <div>
          <p className="text-sm text-stone-600 mb-6">
            Är du säker på att du vill radera <strong>{itemName}</strong>? Denna
            åtgärd kan inte ångras.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
            >
              Avbryt
            </button>
            <button
              onClick={handleFirstConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Ja, radera
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-stone-600 mb-4">
            Skriv <strong>RADERA</strong> nedan för att bekräfta:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 mb-4"
            placeholder="RADERA"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
            >
              Avbryt
            </button>
            <button
              onClick={handleFinalConfirm}
              disabled={confirmText !== "RADERA"}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Radera permanent
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
