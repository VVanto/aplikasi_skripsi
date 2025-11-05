// app/ui/dashboard/alert/Alert.jsx
"use client";

import { useEffect } from "react";
import { MdCheckBox, MdError, MdHelp } from "react-icons/md";
import { useAlert } from "./useAlert";

const Alert = () => {
  const { alert, hide } = useAlert();

  useEffect(() => {
    if (alert?.duration) {
      const timer = setTimeout(hide, alert.duration);
      return () => clearTimeout(timer);
    }
  }, [alert, hide]);

  if (!alert) return null;

  const icons = {
    success: <MdCheckBox className="text-5xl text-green-400" />,
    error: <MdError className="text-5xl text-red-400" />,
    confirm: <MdHelp className="text-5xl text-blue-400" />,
  };

  const colors = {
    success: "bg-darkOlive border-green",
    error: "bg-darkOlive border-red",
    confirm: "bg-darkOlive border-blue",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
      <div
        className={`pointer-events-auto max-w-md w-full p-6 rounded-lg border-2 shadow-2xl flex items-center gap-4 animate-fadeIn ${colors[alert.type]}`}
      >
        <div className="flex-shrink-0">{icons[alert.type]}</div>
        <div className="flex-1">
          <p className="text-xl font-medium">{alert.message}</p>
        </div>

        {alert.type === "confirm" && (
          <div className="flex gap-3">
            <button
              onClick={alert.onCancel}
              className="px-4 py-2 text-base rounded-lg bg-red hover:bg-red/60 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={alert.onConfirm}
              className="px-4 py-2 text-base rounded-lg bg-blue hover:bg-blue/60 transition-colors font-medium"
            >
              Ya
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;