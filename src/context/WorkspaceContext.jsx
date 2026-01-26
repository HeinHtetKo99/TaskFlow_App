import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useWorkspaceData } from "../hooks/useWorkspaceData.js";

const WorkspaceCtx = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, booting } = useAuth();
  const [workspaceId, setWorkspaceId] = useState(null);

  const {
    loading,
    role,
    members,
    workspace,
    refreshWorkspaceId,
  } = useWorkspaceData(user, booting, workspaceId, setWorkspaceId);

  useEffect(() => {
    if (!user) setWorkspaceId(null);
  }, [user]);

  return (
    <WorkspaceCtx.Provider
      value={{
        workspaceId,
        setWorkspaceId,
        loadingWorkspace: loading,
        role,
        members,
        workspace,
        refreshWorkspaceId,
        isAdmin: role === "admin",
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
