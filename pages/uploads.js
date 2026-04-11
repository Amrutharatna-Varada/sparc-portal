import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function Uploads() {
  const [uploads, setUploads] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const router = useRouter();
  const perPage = 12;

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    const q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUploads(data);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    await deleteDoc(doc(db, "updates", id));
    fetchUploads();
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  const getThumbnail = (u) => {
    if (u.fileType?.includes("image")) return u.fileUrl;
    if (u.fileType?.includes("video")) return "/video.png";
    if (u.fileType?.includes("pdf")) return "/pdf.png";
    return "/file.png";
  };

  // 🔥 FILTER LOGIC
  let filtered = uploads.filter((u) =>
    u.projectId?.toLowerCase().includes(search.toLowerCase())
  );

  if (category !== "all") {
    filtered = filtered.filter((u) => u.category === category);
  }

  if (type !== "all") {
    filtered = filtered.filter((u) =>
      u.fileType?.includes(type)
    );
  }

  // 🔥 PAGINATION
  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const [previewIndex, setPreviewIndex] = useState(null);

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
            ← Back
          </button>

          <button className="btn" onClick={() => router.push("/upload")}>
            Upload
          </button>

          <button className="btn danger" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          placeholder="Search project..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          <option value="daily">Daily</option>
          <option value="details">Details</option>
        </select>

        <select onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid">
        {paginated.map((u, index) => (
          <div
            key={u.id}
            className="upload-card"
            onClick={() => setPreviewIndex(index)}
          >
            <img src={getThumbnail(u)} className="thumb" />

            {/* 🔥 METADATA */}
            <div className="card-info">
              <div className="project">{u.projectId}</div>
              <div className="meta">
                {u.category} • {formatDate(u.createdAt)}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="overlay">
              <button
                title="Open"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(u.fileUrl);
                }}
              >
                👁
              </button>

              <button
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(u.id);
                }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>Page {page}</span>

        <button
          disabled={page * perPage >= filtered.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* PREVIEW MODAL */}
      {previewIndex !== null && (
        <div className="preview-modal" onClick={() => setPreviewIndex(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setPreviewIndex(null)}
            >
              ✕
            </button>

            {paginated[previewIndex]?.fileType?.includes("image") && (
              <img src={paginated[previewIndex].fileUrl} />
            )}

            {paginated[previewIndex]?.fileType?.includes("video") && (
              <video src={paginated[previewIndex].fileUrl} controls />
            )}

            {paginated[previewIndex]?.fileType?.includes("pdf") && (
              <iframe src={paginated[previewIndex].fileUrl}></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
}