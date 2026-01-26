import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Overview from "../pages/Overview.jsx";
import Tasks from "../pages/Tasks.jsx";
import Team from "../pages/Team.jsx";
import Trash from "../pages/Trash.jsx";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Protected({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <div className="p-6">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <AppShell />
      </Protected>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: "tasks", element: <Tasks /> },
      { path: "team", element: <Team /> },
      { path: "trash", element: <Trash /> },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnly>
        <Register />
      </PublicOnly>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
