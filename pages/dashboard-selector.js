import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function ClientHome() {
  const [projects, setProjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const snap = await getDocs(collection(db, "projects"));
    setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  return (
    <div>

      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <div className="logo-box">SP</div>
          <span>SPARC Portal</span>
        </div>

        <div className="header-actions">
          <button className="btn" onClick={() => router.push("/admin")}>
            Back
          </button>

          <button className="btn" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="client-container-project">

  <h2>Select Project</h2>

  <div className="project-grid">
    {projects.map((p) => (
      <div
        key={p.id}
        className="project-tile"
        onClick={() => router.push(`/dashboard/${p.id}`)}
      >
        <div className="tile-id">{p.id}</div>
      </div>
    ))}
  </div>

</div>
    </div>
  );
}