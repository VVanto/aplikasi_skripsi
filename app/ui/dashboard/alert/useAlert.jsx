// app/ui/dashboard/alert/useAlert.js
import { create } from "zustand";
import { useCallback } from "react";

const useAlertStore = create((set) => ({
  alert: null,
  showAlert: (config) =>
    set({
      alert: { id: Date.now(), ...config },
    }),
  hideAlert: () => set({ alert: null }),
}));

export const useAlert = () => {
  const { alert, showAlert, hideAlert } = useAlertStore();

  // Memoize semua fungsi agar referensinya stabil!
  const success = useCallback(
    (message, duration = 3000) =>
      showAlert({ type: "success", message, duration }),
    [showAlert]
  );

  const error = useCallback(
    (message, duration = 4000) =>
      showAlert({ type: "error", message, duration }),
    [showAlert]
  );

  const confirm = useCallback(
    (message, onConfirm, onCancel) =>
      showAlert({
        type: "confirm",
        message,
        onConfirm: () => {
          onConfirm?.();
          hideAlert();
        },
        onCancel: () => {
          onCancel?.();
          hideAlert();
        },
      }),
    [showAlert, hideAlert]
  );

  const hide = useCallback(() => hideAlert(), [hideAlert]);

  return { alert, success, error, confirm, hide };
};