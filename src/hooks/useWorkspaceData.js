import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ensureWorkspaceForUser, getUserWorkspaceId } from "../services/workspace.service";
import { collection, doc, onSnapshot } from "firebase/firestore";

function waitForAuthToken(user) {
  return user?.getIdToken ? user.getIdToken() : Promise.resolve();
}

export function useWorkspaceData(user, booting, workspaceId, setWorkspaceId) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);

  // Reset cached workspace data when auth user changes or signs out.
  useEffect(() => {
    if (booting) return;

    if (!user?.uid) {
      setWorkspaceId(null);
      setMembers([]);
      setRole("");
      setWorkspace(null);
      setLoading(false);
      return;
    }

    setWorkspaceId(null);
    setMembers([]);
    setRole("");
    setWorkspace(null);
  }, [booting, user?.uid, setWorkspaceId]);

  // Ensure workspace exists for first signup -> admin
  useEffect(() => {
    if (booting) return;
    if (!user?.uid) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await waitForAuthToken(user);
        if (cancelled) return;

        const wid = await ensureWorkspaceForUser(user);
        if (!cancelled) setWorkspaceId(wid);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [booting, user?.uid, setWorkspaceId]);

  // Subscribe workspace doc
  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setWorkspace(null);
      return;
    }

    let unsub = () => {};
    let cancelled = false;

    waitForAuthToken(user).then(() => {
      if (cancelled) return;

      const wsRef = doc(db, "workspaces", workspaceId);
      unsub = onSnapshot(
        wsRef,
        (snap) => setWorkspace(snap.exists() ? { id: snap.id, ...snap.data() } : null),
        (err) => console.error("Failed to load workspace", err)
      );
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [workspaceId, user?.uid]);

  // Subscribe members list (for Team UI)
  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setMembers([]);
      return;
    }

    let unsub = () => {};
    let cancelled = false;

    setMembers([]);

    waitForAuthToken(user).then(() => {
      if (cancelled) return;

      const memRef = collection(db, "workspaces", workspaceId, "members");
      unsub = onSnapshot(
        memRef,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setMembers(list);
        },
        (err) => console.error("Failed to load members", err)
      );
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [workspaceId, user?.uid]);

  // Subscribe current user's member doc (for role)
  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setRole("");
      return;
    }

    let unsub = () => {};
    let cancelled = false;

    setRole("");

    waitForAuthToken(user).then(() => {
      if (cancelled) return;

      const myRef = doc(db, "workspaces", workspaceId, "members", user.uid);
      unsub = onSnapshot(
        myRef,
        (snap) => setRole(snap.exists() ? snap.data().role || "" : ""),
        (err) => console.error("Failed to load member role", err)
      );
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [workspaceId, user?.uid]);

  // Used by other places (after accept invite etc)
  const refreshWorkspaceId = async () => {
    if (!user?.uid) return null;
    const wid = await getUserWorkspaceId(user.uid);
    if (wid) setWorkspaceId(wid);
    return wid;
  };

  return { loading, role, members, workspace, refreshWorkspaceId };
}
