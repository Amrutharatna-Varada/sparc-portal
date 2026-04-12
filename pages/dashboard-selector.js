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

  const logout = () => {
    signOut(auth)
    router.push("/login");
  };

  return (
    <div>

      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <div className="logo-wrapper">
  <img src="/logo-sp.jpeg" className="logo-img" />
</div>
          <span className="brand-title">SP Portal</span>
        </div>

        <div className="header-actions">
          <button className="btn" onClick={() => router.push("/admin")}>
            Back to Admin Home
          </button>

          <button className="btn" onClick={logout}>
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