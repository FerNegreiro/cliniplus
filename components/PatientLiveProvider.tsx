"use client";

import { useSyncExternalStore } from "react";
import {
  getDefaultPatientData,
  getPatientLiveKey,
  readPatientLiveData,
  writePatientLiveData,
  type LivePatientData,
} from "@/utils/patientLiveData";

function usePatientLiveSnapshot(pacienteId: number) {
  const fallback = JSON.stringify(getDefaultPatientData(pacienteId));

  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("cliniplus:patient-live", onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener("cliniplus:patient-live", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem(getPatientLiveKey(pacienteId)) ?? fallback,
    () => fallback
  );
}

export function usePatientLiveData(pacienteId: number) {
  usePatientLiveSnapshot(pacienteId);

  const data = readPatientLiveData(pacienteId);

  function save(nextData: LivePatientData) {
    writePatientLiveData(pacienteId, nextData);
  }

  return { data, save };
}
