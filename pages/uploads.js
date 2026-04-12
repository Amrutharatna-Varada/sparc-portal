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
import { Trash2 } from "lucide-react";

export default function Uploads() {
    const [uploads, setUploads] = useState([]);

    const [projectFilter, setProjectFilter] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");

    const [page, setPage] = useState(1);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [fileTypeFilter, setFileTypeFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState({
        key: "createdAt", // default
        direction: "desc" // desc = latest first
    });

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

    const logout = () => {
        signOut(auth)
        router.push("/login");

  };

    const getThumbnail = (u) => {
        if (u.fileType?.includes("image")) return u.fileUrl;
        if (u.fileType?.includes("video")) return "/video.png";
        if (u.fileType?.includes("pdf")) return "/pdf.png";
        return "/file.png";
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // 🔁 toggle direction
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }

            // new key → default asc
            return { key, direction: "asc" };
        });
    };

    // 🔥 FILTER LOGIC
    let filtered = uploads;

    // Project
    if (projectFilter) {
        filtered = filtered.filter((u) => u.projectId === projectFilter);
    }

    // Category
    if (category !== "all") {
        filtered = filtered.filter((u) => u.category === category);
    }

    // 🔥 FILE TYPE FILTER
    if (fileTypeFilter !== "all") {
        filtered = filtered.filter((u) => {
            const type = u.fileType || "";
            const url = u.fileUrl || "";

            if (fileTypeFilter === "image") {
                return (
                    type.startsWith("image/") ||
                    url.match(/\.(jpg|jpeg|png|webp)$/i)
                );
            }

            if (fileTypeFilter === "pdf") {
                return (
                    type.includes("pdf") ||
                    url.match(/\.pdf$/i)
                );
            }

            if (fileTypeFilter === "doc") {
                return (
                    type.includes("word") ||
                    url.match(/\.(doc|docx)$/i)
                );
            }

            return true;
        });
    }

    // 🔥 DATE FILTER (NEW)
    if (selectedDate) {
        filtered = filtered.filter((u) => {
            if (!u.createdAt) return false;

            const fileDate = new Date(u.createdAt.seconds * 1000);
            const selected = new Date(selectedDate);

            return (
                fileDate.getFullYear() === selected.getFullYear() &&
                fileDate.getMonth() === selected.getMonth() &&
                fileDate.getDate() === selected.getDate()
            );
        });
    }

    const sortedData = [...filtered].sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === "createdAt") {
            valA = a.createdAt?.seconds || 0;
            valB = b.createdAt?.seconds || 0;
        }

        if (sortConfig.key === "fileName") {
            valA = (a.fileName || "").toLowerCase();
            valB = (b.fileName || "").toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;

        return 0;
    });

    const paginated = sortedData.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const clearFilters = () => {
        setProjectFilter("");
        setCategory("all");
        setSelectedDate("");
        setFileTypeFilter("all");
        setPage(1);
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
                        ← Back to Admin Home
                    </button>

                    <button className="btn" onClick={() => router.push("/upload")}>
                        Upload
                    </button>

                    <button className="btn danger" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* 🔥 FILTERS */}
            <div className="filters">

                {/* Project Dropdown */}
                <select onChange={(e) => setProjectFilter(e.target.value)}>
                    <option value="">All Projects</option>
                    {[...new Set(uploads.map(u => u.projectId))].map(p => (
                        <option key={p}>{p}</option>
                    ))}
                </select>

                {/* Category Buttons */}
                <div className="chips">
                    <button
                        className={category === "all" ? "active" : ""}
                        onClick={() => setCategory("all")}
                    >
                        All
                    </button>

                    <button
                        className={category === "daily-updates" ? "active" : ""}
                        onClick={() => setCategory("daily-updates")}
                    >
                        Daily Updates
                    </button>

                    <button
                        className={category === "project-details" ? "active" : ""}
                        onClick={() => setCategory("project-details")}
                    >
                        Project Details
                    </button>
                </div>

                <div className="chips">
                    <button
                        className={fileTypeFilter === "all" ? "active" : ""}
                        onClick={() => setFileTypeFilter("all")}
                    >
                        All Types
                    </button>

                    <button
                        className={fileTypeFilter === "image" ? "active" : ""}
                        onClick={() => setFileTypeFilter("image")}
                    >
                        Images
                    </button>

                    <button
                        className={fileTypeFilter === "pdf" ? "active" : ""}
                        onClick={() => setFileTypeFilter("pdf")}
                    >
                        PDF
                    </button>

                    <button
                        className={fileTypeFilter === "doc" ? "active" : ""}
                        onClick={() => setFileTypeFilter("doc")}
                    >
                        DOCX
                    </button>
                </div>

                <button
                    className={sortConfig.key === "createdAt" ? "active" : ""}
                    onClick={() => handleSort("createdAt")}
                >
                    Date {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </button>




                {/* 🔥 DATE PICKER */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />

                {/* Clear date */}
                {selectedDate && (
                    <button
                        className="btn-outline"
                        onClick={() => setSelectedDate("")}
                    >
                        Clear Date
                    </button>
                )}

                <button className="clear-btn" onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            {/* GRID */}
            <div className="uploads-grid">
                {paginated.map((u, index) => (
                    <div
                        key={u.id}
                        className="uploads-card"
                        onClick={(e) => {
                            const isPDF = u.fileType?.includes("pdf");
                            const isDOC = u.fileType?.includes("doc");

                            if (isPDF) {
                                e.stopPropagation(); // 🔥 important
                                const newTab = window.open(u.fileUrl, "_blank");

                                // 🔥 fallback if popup blocked
                                if (!newTab) {
                                    window.location.href = u.fileUrl;
                                }

                                return;
                            }

                            if (isDOC) {
                                const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(u.fileUrl)}&embedded=true`;
                                window.open(viewerUrl, "_blank");
                                return;
                            }

                            setPreviewIndex(index);
                        }}
                    >
                        {u.fileType?.includes("image") ? (
                            <img src={u.fileUrl} className="thumb" />
                        ) : (
                            <div className="thumb placeholder">

                                {u.fileType?.includes("pdf") && (
                                    <div className="file-preview">
                                        <div className="file-icon">📄</div>
                                        <div className="file-name">
                                            {u.fileName || "Document.pdf"}
                                        </div>
                                    </div>
                                )}

                                {u.fileType?.includes("doc") && (
                                    <div className="file-preview">
                                        <div className="file-icon">📄</div>
                                        <div className="file-name">
                                            {u.fileName || "Document"}
                                        </div>
                                    </div>
                                )}

                                {u.fileType?.includes("video") && "🎥"}

                                {!u.fileType && "📁"}

                            </div>
                        )}

                        <div className="card-info">
                            <div className="project">{u.projectId}</div>

                            <div className="meta">
                                {u.category === "daily-updates"
                                    ? "Daily Update"
                                    : "Project Detail"}
                            </div>

                            <div className="meta small">
                                {formatDate(u.createdAt)}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="overlay">

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(u.id);
                                }}
                            >
                                <Trash2 size={16} />
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
                        <button className="close-btn" onClick={() => setPreviewIndex(null)}>
                            ✕
                        </button>

                        {paginated[previewIndex]?.fileType?.includes("image") && (
                            <img src={paginated[previewIndex].fileUrl} />
                        )}

                        {paginated[previewIndex]?.fileType?.includes("video") && (
                            <video src={paginated[previewIndex].fileUrl} controls />
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}