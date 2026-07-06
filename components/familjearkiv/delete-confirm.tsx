"use client";

import { useId, useState } from "react";
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
  const uid = useId();
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
          <p className="text-[15px] text-stone-700 mb-6">
            Är du säker på att du vill radera <strong>{itemName}</strong>?
            Denna åtgärd kan inte ångras.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-ink rounded-lg"
            >
              Avbryt
            </button>
            <button
              onClick={handleFirstConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
            >
              Ja, radera
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor={`${uid}-confirm`}
            className="block text-[15px] text-stone-700 mb-4"
          >
            Skriv <strong>RADERA</strong> nedan för att bekräfta:
          </label>
          <input
            id={`${uid}-confirm`}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-stone-300 text-[15px] text-ink focus:border-red-600 mb-4"
            placeholder="RADERA"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-ink rounded-lg"
            >
              Avbryt
            </button>
            <button
              onClick={handleFinalConfirm}
              disabled={confirmText !== "RADERA"}
              className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Radera permanent
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
