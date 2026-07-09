import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

  const [inboxInvites, setInboxInvites] = useState([]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const pendingInvite = useMemo(() => {
    const next = inboxInvites.find((x) => x.status === "pending") || null;
    if (!next) return null;
    if (!next.workspaceId) return next;
    if (!workspaceId || next.workspaceId !== workspaceId) return next;
    return null;
  }, [inboxInvites, workspaceId]);

  // Realtime inbox listener; pending invite is derived from inbox + workspaceId.
  useEffect(() => {
    if (!authReady) return;

    if (!user?.email) {
      setInboxInvites([]);
      setInviteError("");
      return;
    }

    let unsub = () => {};
    let cancelled = false;

    setInboxInvites([]);
    setInviteError("");

    user
      .getIdToken()
      .then(() => {
        if (cancelled) return;

        unsub = subscribeInviteInbox(
          user,
          (invites) => setInboxInvites(invites),
          (err) => {
            setInviteError(err?.message || "Missing or insufficient permissions.");
            setInboxInvites([]);
          }
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setInviteError(err?.message || "Failed to load invitations.");
          setInboxInvites([]);
        }
      });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [authReady, user?.email, user?.uid]);

  const closeInviteModal = () => setInboxInvites((prev) => prev.filter((x) => x.status !== "pending"));

  const acceptPendingInvite = async () => {
    if (!user || !pendingInvite) return;
    setInviteBusy(true);
    setInviteError("");
    try {
      const wid = await acceptInvite({ user, invite: pendingInvite });
      setWorkspaceId(wid);
      setInboxInvites((prev) => prev.filter((x) => x.id !== pendingInvite.id));
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
      setInboxInvites((prev) => prev.filter((x) => x.id !== pendingInvite.id));
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
