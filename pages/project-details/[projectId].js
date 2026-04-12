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
import { signOut } from "firebase/auth";

export default function ProjectDetails() {
  const router = useRouter();
  const { projectId } = router.query;

  const [files, setFiles] = useState([]);
  const [view, setView] = useState("root"); // root | drawings | folder | agreement
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    const q = query(
      collection(db, "updates"),
      where("projectId", "==", projectId),
      where("category", "==", "project-details"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const logout = () => {
    signOut(auth)
    router.push("/login");
  };

  // 🔥 FILTER DATA
  const agreementFiles = files.filter(f => f.mainCategory === "agreement");
  const drawings = files.filter(f => f.mainCategory === "drawings");

  const grouped = {};
  drawings.forEach(f => {
    if (!grouped[f.subCategory]) grouped[f.subCategory] = [];
    grouped[f.subCategory].push(f);
  });

  let currentFiles = [];
  if (view === "agreement") currentFiles = agreementFiles;
  if (view === "folder") currentFiles = grouped[selectedFolder] || [];

  // 🔥 FORMAT LABEL
  const formatLabel = (text) => {
    return text
      ?.replace("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // 🔥 BREADCRUMB LOGIC
  const getBreadcrumb = () => {
    const items = [
      { label: "Project Details", action: () => {
        setView("root");
        setSelectedFolder(null);
      }}
    ];

    if (view === "drawings") {
      items.push({
        label: "Drawings",
        action: () => setView("drawings")
      });
    }

    if (view === "folder") {
      items.push({
        label: "Drawings",
        action: () => setView("drawings")
      });

      items.push({
        label: formatLabel(selectedFolder),
        action: null
      });
    }

    if (view === "agreement") {
      items.push({
        label: "Agreement",
        action: null
      });
    }

    return items;
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <div className="logo-wrapper">
            <img src="/logo-sp.jpeg" className="logo-img" />
          </div>
          <span className="brand-title">SP Portal</span>
        </div>

        <div className="header-actions">
          <button onClick={() => router.back()} className="btn">
            Back to Updates
          </button>

          <button onClick={logout} className="btn">
            Logout
          </button>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="title">{projectId} Details</h2>

      {/* 🔥 BREADCRUMB */}
      <div className="breadcrumb">
        {getBreadcrumb().map((item, index) => (
          <span key={index}>
            <span
              className="crumb"
              onClick={item.action}
              style={{
                cursor: item.action ? "pointer" : "default",
                opacity: item.action ? 0.8 : 1
              }}
            >
              {item.label}
            </span>

            {index < getBreadcrumb().length - 1 && (
              <span className="separator"> / </span>
            )}
          </span>
        ))}
      </div>

      {/* ROOT */}
      {view === "root" && (
        <div className="details-grid">

          <div className="details-card" onClick={() => setView("agreement")}>
            📄 Agreement
          </div>

          <div className="details-card" onClick={() => setView("drawings")}>
            📁 Drawings
          </div>

        </div>
      )}

      {/* DRAWINGS */}
      {view === "drawings" && (
        <div className="details-grid">

          {Object.keys(grouped).map(folder => (
            <div
              key={folder}
              className="details-card"
              onClick={() => {
                setSelectedFolder(folder);
                setView("folder");
              }}
            >
              📁 {formatLabel(folder)}
            </div>
          ))}

        </div>
      )}

      {/* FILE VIEW */}
      {(view === "agreement" || view === "folder") && (
        <div className="details-grid">

          {currentFiles.length === 0 && (
            <p style={{ color: "#aaa" }}>No files available</p>
          )}

          {currentFiles.map(file => (
            <div key={file.id} className="details-card">

              {file.fileType?.includes("image") ? (
                <img
                  src={file.fileUrl}
                  className="details-img"
                  onClick={() => window.open(file.fileUrl)}
                />
              ) : (
                <div className="pdf-card">
                  <div className="pdf-icon">📄</div>
                  <div className="pdf-name">{file.fileName}</div>

                  <div className="pdf-actions">
                    <a href={file.fileUrl} target="_blank" className="btn">
                      View
                    </a>
                  </div>
                </div>
              )}

            </div>
          ))}

        </div>
      )}
    </div>
  );
}