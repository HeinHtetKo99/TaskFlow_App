import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { acceptInviteIfAny } from "../services/invites.service.js";

export function useWorkspaceData(user, booting, workspaceId, setWorkspaceId) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);

  const refreshWorkspaceId = async () => {
    if (!user) return;
    const uref = doc(db, "users", user.uid);
    const usnap = await getDoc(uref);
    const wid = usnap.exists() ? usnap.data().workspaceId : null;
    setWorkspaceId(wid || null);
  };

  useEffect(() => {
    let unsubMembers = null;
    let unsubWorkspace = null;

    const run = async () => {
      if (booting) return;
      if (!user) {
        setLoading(false);
        setRole(null);
        setMembers([]);
        setWorkspace(null);
        return;
      }

      setLoading(true);

      // 1) load workspaceId from users/{uid}
      const uref = doc(db, "users", user.uid);
      const usnap = await getDoc(uref);
      let wid = usnap.exists() ? usnap.data().workspaceId : null;

      // 2) If no workspace yet, try accept invite automatically
      if (!wid) {
        const acceptedWid = await acceptInviteIfAny(user);
        if (acceptedWid) wid = acceptedWid;
      }

      setWorkspaceId(wid || null);

      if (!wid) {
        setRole(null);
        setMembers([]);
        setWorkspace(null);
        setLoading(false);
        return;
      }

      // workspace live
      unsubWorkspace = onSnapshot(doc(db, "workspaces", wid), (snap) => {
        setWorkspace(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      });

      // members live
      const mref = collection(db, "workspaces", wid, "members");
      unsubMembers = onSnapshot(query(mref, orderBy("joinedAt", "asc")), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(list);
        const me = list.find((x) => x.uid === user.uid);
        setRole(me?.role || null);
        setLoading(false);
      });
    };

    run();

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubWorkspace) unsubWorkspace();
    };
  }, [user, booting]); // keep simple

  return { loading, role, members, workspace, refreshWorkspaceId };
}
