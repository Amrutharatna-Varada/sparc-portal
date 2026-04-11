import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth"

export default function ProjectDashboard() {
  const router = useRouter();
  const { projectId } = router.query;

  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return router.push("/");

    const q = query(
      collection(db, "users"),
      where("email", "==", user.email)
    );

    const snap = await getDocs(q);

    if (snap.empty) return router.push("/");

    const userData = snap.docs[0].data();

    // 🔥 ADMIN → allow all dashboards
    if (userData.role === "admin") {
      return; // allow access
    }

    // 🔒 CLIENT → restrict to their project only
    if (userData.projectId !== projectId) {
      return router.push(`/dashboard/${userData.projectId}`);
    }

  });

  return () => unsub();
}, []);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      const q = query(
        collection(db, "updates"),
        where("projectId", "==", projectId),
        where("category", "==", "daily-updates"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFiles(data);
    };

    fetchData();
  }, [projectId]);

  const logout = () => {
    router.push("/login");
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="header">
        <h1>{projectId} Updates</h1>

        <div className="actions">
          <button
            className="btn-outline"
            onClick={() => router.push(`/project-details/${projectId}`)}
          >
            Project Details
          </button>

          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid">
        {files.map((item) => {
          const isVideo = item.fileUrl?.includes(".mp4");

          return (
            <div
              key={item.id}
              className="card"
              onClick={() => setSelected(item)}
            >
              {isVideo ? (
                <video src={item.fileUrl} />
              ) : (
                <img src={item.fileUrl} alt="" />
              )}
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {files.length === 0 && (
        <p className="empty">No updates yet</p>
      )}

      {/* MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selected.fileUrl.includes(".mp4") ? (
              <video src={selected.fileUrl} controls />
            ) : (
              <img src={selected.fileUrl} />
            )}

            <button className="close-btn" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}