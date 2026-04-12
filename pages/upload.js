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

  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

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

    // 🔥 validation
    if (category === "project-details") {
      if (!mainCategory) return alert("Select section");

      if (mainCategory === "drawings" && !subCategory) {
        return alert("Select drawing type");
      }
    }

    const storageRef = ref(
      storage,
      `projects/${projectId}/${Date.now()}-${file.name}`
    );

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "updates"), {
      projectId,
      category,

      mainCategory: category === "project-details" ? mainCategory : null,
      subCategory:
        category === "project-details" && mainCategory === "drawings"
          ? subCategory
          : null,

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

      <div className="header">
        <div className="brand">
          <div className="logo-wrapper">
            <img src="/logo-sp.jpeg" className="logo-img" />
          </div>
          <span className="brand-title">SP Portal</span>
        </div>

        <div className="header-actions">
          <button onClick={() => router.push("/admin")} className="btn-outline">
            ← Back to Admin Home
          </button>

          <button onClick={() => router.push("/uploads")} className="btn-outline">
            Manage Uploads
          </button>

          <button onClick={() => signOut(auth)} className="btn-outline">
            Logout
          </button>
        </div>
      </div>

      <div className="upload-card">

        <h2>Upload Files</h2>

        <select onChange={e => setProjectId(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {/* 🔥 CATEGORY */}
        <select onChange={e => setCategory(e.target.value)}>
          <option value="daily-updates">Daily Updates</option>
          <option value="project-details">Project Details</option>
        </select>

        {/* 🔥 PROJECT DETAILS EXTRA */}
        {category === "project-details" && (
          <>
            <select onChange={e => setMainCategory(e.target.value)}>
              <option value="">Select Section</option>
              <option value="agreement">Agreement</option>
              <option value="drawings">Drawings</option>
            </select>

            {mainCategory === "drawings" && (
              <select onChange={e => setSubCategory(e.target.value)}>
                <option value="">Select Drawing Type</option>

                <option value="floor-plan">Floor Plan</option>
                <option value="elevation">Elevation</option>
                <option value="structural">Structural</option>
                <option value="working">Working Drawings</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="landscape">Landscape</option>
              </select>
            )}
          </>
        )}

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <button onClick={upload} className="btn-primary">
          Upload
        </button>

      </div>
    </div>
  );
}