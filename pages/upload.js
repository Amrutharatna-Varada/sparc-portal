import { useEffect, useState } from "react";
import { db, storage, auth } from "../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useRef } from "react";

export default function Upload() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");

  const [category, setCategory] = useState("daily-updates");


  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [files, setFiles] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
const fileRef = useRef();


  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const snap = await getDocs(collection(db, "projects"));
    setProjects(snap.docs.map(d => d.id));
  };
  const showPopup = (message, type = "info") => {
  setPopup({ show: true, message, type });

  setTimeout(() => {
    setPopup({ show: false, message: "", type: "" });
  }, 3000);
};

const logout = () => {
    signOut(auth)
    router.push("/login");
  };

  const resetForm = () => {
  setFiles([]);
  setProjectId("");
  setCategory("daily-updates");
  setMainCategory("");
  setSubCategory("");

  if (fileRef.current) fileRef.current.value = null;
};

  const upload = async () => {
  if (!files.length || !projectId) {
    showPopup("Missing fields", "error");
    return;
  }

  try {
    setUploading(true);
    setProgress(0);

    let totalProgress = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const storageRef = ref(
        storage,
        `projects/${projectId}/${Date.now()}-${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percent =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            // 🔥 combine progress for multiple files
            const overallProgress =
              ((i + percent / 100) / files.length) * 100;

            setProgress(Math.round(overallProgress));
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            await addDoc(collection(db, "updates"), {
              projectId,
              category,
              mainCategory:
                category === "project-details" ? mainCategory : null,
              subCategory:
                category === "project-details" &&
                mainCategory === "drawings"
                  ? subCategory
                  : null,
              fileUrl: url,
              fileType: file.type,
              fileName: file.name,
              createdAt: new Date(),
            });

            resolve();
          }
        );
      });
    }

    showPopup("Uploaded successfully ✅", "success");
    resetForm()
  } catch (err) {
    console.error(err);
    showPopup("Upload failed ❌", "error");
  } finally {
    setUploading(false);
    setProgress(0);
  }
};

  return (
    <div className="upload-page">
        {popup.show && (
  <div className={`upload-popup ${popup.type}`}>
    {popup.message}
  </div>
)}
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

          <button onClick={logout} className="btn-outline">
            Logout
          </button>
        </div>
      </div>

      <div className="upload-card">

        <h2>Upload Files</h2>

        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {/* 🔥 CATEGORY */}
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="daily-updates">Daily Updates</option>
          <option value="project-details">Project Details</option>
        </select>

        {/* 🔥 PROJECT DETAILS EXTRA */}
        {category === "project-details" && (
          <>
            <select value={mainCategory} onChange={e => setMainCategory(e.target.value)}>
              <option value="">Select Section</option>
              <option value="agreement">Agreement</option>
              <option value="drawings">Drawings</option>
            </select>

            {mainCategory === "drawings" && (
              <select value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                <option value="">Select Drawing Type</option>

                <option value="floor-plan">Floor Plan</option>
                <option value="elevation">Elevation</option>
                <option value="interiors">Interiors</option>
                <option value="structural">Structural</option>
                <option value="working">Working Drawings</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="landscape">Landscape</option>
              </select>
            )}
          </>
        )}

        <input
  type="file"
  ref={fileRef}
  multiple
  onChange={(e) => setFiles(Array.from(e.target.files))}
/>

{uploading && (
  <div className="progress-container">
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span>{progress}%</span>
  </div>
)}
        <button onClick={upload} className="btn-primary">
          Upload
        </button>

      </div>
    </div>
  );
}