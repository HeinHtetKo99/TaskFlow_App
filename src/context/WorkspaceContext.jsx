import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useWorkspaceData } from "../hooks/useWorkspaceData.js";
import {
  acceptInvite,
  declineInvite,
  subscribeInviteInbox,
} from "../services/invites.service.js";

const WorkspaceCtx = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, booting } = useAuth();

  const [workspaceId, setWorkspaceId] = useState(null);

  const { loading, role, members, workspace, refreshWorkspaceId } =
    useWorkspaceData(user, booting, workspaceId, setWorkspaceId);

  // 🔒 keep latest workspaceId without resubscribing realtime listener
  const workspaceIdRef = useRef(null);
  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  // invite UI
  const [pendingInvite, setPendingInvite] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const dismissedIdRef = useRef(""); // don’t reopen same invite after user closes

  // ✅ REALTIME invite listener (NO refresh, NO lost events)
  useEffect(() => {
    if (!user || booting) return;

    setInviteError("");

    const unsub = subscribeInviteInbox(
      user,
      (invites) => {
        // pick first pending invite
        const next = invites.find((x) => x.status === "pending") || null;

        if (!next) {
          setPendingInvite(null);
          dismissedIdRef.current = "";
          return;
        }

        // if user closed this invite already, don't reopen until it changes
        if (dismissedIdRef.current && dismissedIdRef.current === next.id) {
          setPendingInvite(null);
          return;
        }

        // show if invite targets different workspace than current
        const currentWid = workspaceIdRef.current;
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
  }, [user?.uid, booting]); // ✅ DO NOT depend on workspaceId

  const closeInviteModal = () => {
    if (pendingInvite?.id) dismissedIdRef.current = pendingInvite.id;
    setPendingInvite(null);
  };

  const acceptPendingInvite = async () => {
    if (!user || !pendingInvite) return;
    setInviteBusy(true);
    setInviteError("");
    try {
      const wid = await acceptInvite({ user, invite: pendingInvite });
      setWorkspaceId(wid);
      setPendingInvite(null);
      dismissedIdRef.current = "";
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
      dismissedIdRef.current = "";
      await refreshWorkspaceId();
    } catch (e) {
      setInviteError(e?.message || "Failed to decline invite.");
    } finally {
      setInviteBusy(false);
    }
  };

  const value = useMemo(
    () => ({
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
    }),
    [
      workspaceId,
      loading,
      role,
      members,
      workspace,
      refreshWorkspaceId,
      pendingInvite,
      inviteBusy,
      inviteError,
    ]
  );

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
