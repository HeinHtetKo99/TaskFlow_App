import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useWorkspaceData } from "../hooks/useWorkspaceData.js";
import {
  acceptInvite,
  declineInvite,
  subscribeInviteInbox,
} from "../services/invites.service.js";

const WorkspaceCtx = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, authReady } = useAuth();

  const [workspaceId, setWorkspaceId] = useState(null);

  const { loading, role, members, workspace, refreshWorkspaceId } =
    useWorkspaceData(user, !authReady, workspaceId, setWorkspaceId);

  // keep latest workspaceId without resubscribing listener
  const widRef = useRef(null);
  useEffect(() => {
    widRef.current = workspaceId;
  }, [workspaceId]);

  // invite state
  const [pendingInvite, setPendingInvite] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // ✅ REALTIME inbox listener (NO refresh)
  useEffect(() => {
    if (!authReady) return;
    if (!user?.email) return;

    setInviteError("");

    const unsub = subscribeInviteInbox(
      user,
      (invites) => {
        const next = invites.find((x) => x.status === "pending") || null;

        if (!next) {
          setPendingInvite(null);
          return;
        }

        const currentWid = widRef.current;
        if (next.workspaceId && next.workspaceId !== currentWid) {
          setPendingInvite(next);
        } else {
          setPendingInvite(null);
        }
      },
      (err) => {
        setInviteError(err?.message || "Missing or insufficient permissions.");
        setPendingInvite(null);
      }
    );

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [authReady, user?.email]); // ✅ important

  const closeInviteModal = () => setPendingInvite(null);

  const acceptPendingInvite = async () => {
    if (!user || !pendingInvite) return;
    setInviteBusy(true);
    setInviteError("");
    try {
      const wid = await acceptInvite({ user, invite: pendingInvite });
      setWorkspaceId(wid);
      setPendingInvite(null);
      await refreshWorkspaceId();
    } catch (e) {
      setInviteError(e?.message || "Failed to accept invite.");
    } finally {
      setInviteBusy(false);
    }
  };

  const declinePendingInvite = async () => {
    if (!user || !pendingInvite) return;
    setInviteBusy(true);
    setInviteError("");
    try {
      await declineInvite({ user, invite: pendingInvite });
      setPendingInvite(null);
      await refreshWorkspaceId();
    } catch (e) {
      setInviteError(e?.message || "Failed to decline invite.");
    } finally {
      setInviteBusy(false);
    }
  };

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

        pendingInvite,
        inviteBusy,
        inviteError,
        acceptPendingInvite,
        declinePendingInvite,
        closeInviteModal,
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
