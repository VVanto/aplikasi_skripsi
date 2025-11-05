// app/ui/dashboard/alert/useAlert.js
import { create } from "zustand";

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

  const success = (message, duration = 3000) =>
    showAlert({ type: "success", message, duration });

  const error = (message, duration = 4000) =>
    showAlert({ type: "error", message, duration });

  const confirm = (message, onConfirm, onCancel) =>
    showAlert({
      type: "confirm",
      message,
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        hideAlert();
      },
    });

  return { alert, success, error, confirm, hide: hideAlert };
};