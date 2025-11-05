// app/ui/dashboard/alert/AlertProvider.jsx
"use client";

import Alert from "./Alert";

const AlertProvider = ({ children }) => {
  return (
    <>
      {children}
      <Alert />
    </>
  );
};

export default AlertProvider;