import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ensureWorkspaceForUser, getUserWorkspaceId } from "../services/workspace.service";
import { collection, doc, onSnapshot } from "firebase/firestore";

export function useWorkspaceData(user, booting, workspaceId, setWorkspaceId) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);

  // ✅ Ensure workspace exists for first signup -> admin
  useEffect(() => {
    if (booting) return;
    if (!user?.uid) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const wid = await ensureWorkspaceForUser(user);
        if (!cancelled) setWorkspaceId(wid);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [booting, user?.uid]); // ✅ important: only depends on auth state

  // ✅ Subscribe workspace doc
  useEffect(() => {
    if (!workspaceId) return;

    const wsRef = doc(db, "workspaces", workspaceId);
    const unsub = onSnapshot(
      wsRef,
      (snap) => setWorkspace(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setWorkspace(null)
    );

    return () => unsub();
  }, [workspaceId]);

  // ✅ Subscribe members list (for Team UI)
  useEffect(() => {
    if (!workspaceId) return;

    const memRef = collection(db, "workspaces", workspaceId, "members");
    const unsub = onSnapshot(
      memRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(list);
      },
      () => setMembers([])
    );

    return () => unsub();
  }, [workspaceId]);

  // ✅ Subscribe current user's member doc (for role)
  useEffect(() => {
    if (!workspaceId || !user?.uid) return;

    const myRef = doc(db, "workspaces", workspaceId, "members", user.uid);
    const unsub = onSnapshot(
      myRef,
      (snap) => setRole(snap.exists() ? snap.data().role || "" : ""),
      () => setRole("")
    );

    return () => unsub();
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
