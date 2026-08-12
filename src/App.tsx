import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";

import { checkAuth } from "./lib/auth";

const dashboardPath = import.meta.env.VITE_DASHBOARD_PATH || "/dashboard";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!checkAuth()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <div className="min-h-screen font-sans bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path={dashboardPath}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

