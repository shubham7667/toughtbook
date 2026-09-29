import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL = "http://localhost:8000";

const AdminProtectedRoute = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(
          `${API_URL}/admin/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          setStatus("authorized");
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setStatus("unauthorized");
          return;
        }

        setStatus("unauthorized");
      } catch (error) {
        console.error("Admin authorization check failed:", error);
        setStatus("unauthorized");
      }
    };

    checkAdmin();
  }, []);

  // Wait while checking the admin cookie
  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fc]">
        <div className="text-sm text-slate-500">
          Checking authorization...
        </div>
      </div>
    );
  }

  // Normal user / unauthorized user
  if (status === "unauthorized") {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // Admin
  return <Outlet />;
};

export default AdminProtectedRoute;