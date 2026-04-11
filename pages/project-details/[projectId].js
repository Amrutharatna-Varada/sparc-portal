import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function ProjectDetails() {
  const router = useRouter();
  const { projectId } = router.query;

  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/");

      fetchFiles();
    });

    return () => unsub();
  }, [projectId]);

  const fetchFiles = async () => {
    const q = query(
      collection(db, "updates"),
      where("projectId", "==", projectId),
      where("category", "==", "project-details"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <div className="logo-box">SP</div>
          <span>SPARC Portal</span>
        </div>

        <div className="header-actions">
          <button className="btn" onClick={() => router.back()}>
            Back
          </button>

          <button className="btn" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="title">{projectId} Details</h2>

      {/* GRID */}
      <div className="details-grid">
        {files.length === 0 && (
          <p style={{ color: "#aaa" }}>No project details uploaded</p>
        )}

        {files.map((file) => (
          <div key={file.id} className="details-card">

            {/* IMAGE */}
            {file.fileType?.includes("image") ? (
              <img
                src={file.fileUrl}
                className="details-img"
                onClick={() => window.open(file.fileUrl, "_blank")}
              />
            ) : (
              /* PDF CARD */
              <div className="pdf-card">

                <div className="pdf-icon">📄</div>

                <div className="pdf-name">
                  {file.fileName || "Project Document"}
                </div>

                <div className="pdf-actions">

                  <a
                    href={file.fileUrl}
                    target="_blank"
                    className="btn"
                  >
                    View
                  </a>
                </div>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}