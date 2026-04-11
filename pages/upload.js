import { useEffect, useState } from "react";
import { db, storage, auth } from "../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function Upload() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("daily-updates");
  const [file, setFile] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const snap = await getDocs(collection(db, "projects"));
    setProjects(snap.docs.map(d => d.id));
  };

  const upload = async () => {
    if (!file || !projectId) return alert("Missing fields");

    if (category === "daily-updates" && file.type === "application/pdf") {
      return alert("PDF not allowed in daily updates");
    }

    const storageRef = ref(storage, `projects/${projectId}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "updates"), {
      projectId,
      category,
      fileUrl: url,
      fileType: file.type,
      fileName: file.name,
      createdAt: new Date(),
    });

    alert("Uploaded ✅");
    setFile(null);
  };

  return (
    <div className="upload-page">

      {/* 🔹 HEADER */}
      <div className="header">
        <div className="brand">
          <div className="logo-box">SP</div>
          <span>SPARC Portal</span>
        </div>

        <div className="header-actions">
          <button onClick={() => router.push("/admin")} className="btn-outline">
            Back
          </button>

          <button onClick={() => router.push("/uploads")} className="btn-outline">
            Manage Uploads
          </button>

          <button onClick={() => signOut(auth)} className="btn-outline">
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 CARD */}
      <div className="upload-card">

        <h2>Upload Files</h2>

        <select onChange={e => setProjectId(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select onChange={e => setCategory(e.target.value)}>
          <option value="daily-updates">Daily Updates</option>
          <option value="project-details">Project Details</option>
        </select>

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <button onClick={upload} className="btn-primary">
          Upload
        </button>

      </div>

    </div>
  );
}