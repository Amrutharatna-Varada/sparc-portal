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
import { onAuthStateChanged } from "firebase/auth";

export default function ProjectDashboard() {
  const router = useRouter();
  const { projectId } = router.query;

  const [files, setFiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [loading, setLoading] = useState(true);

  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === files.length - 1;

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

      if (userData.role === "admin") {
        setIsAdmin(true);
        return;
      }

      if (userData.projectId !== projectId) {
        return router.push(`/dashboard/${userData.projectId}`);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setLoading(true)
      const q = query(
        collection(db, "updates"),
        where("projectId", "==", projectId),
        where("category", "==", "daily-updates"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setFiles(data);
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  const logout = () => {
    router.push("/login");
  };

  const next = () => {
    setSelectedIndex((prev) =>
      prev === files.length - 1 ? prev : prev + 1
    );
  };

  const prev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? prev : prev - 1
    );
  };

  const groupFiles = () => {
    const monthGroups = {};

    files.forEach((file) => {
      if (!file.createdAt) return;

      const date = new Date(file.createdAt.seconds * 1000);

      // 🔥 Month label
      const monthKey = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      // 🔥 Day label
      const dayKey = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {};
      }

      if (!monthGroups[monthKey][dayKey]) {
        monthGroups[monthKey][dayKey] = [];
      }

      monthGroups[monthKey][dayKey].push(file);
    });

    return monthGroups;
  };

  const groupedFiles = groupFiles();

  // 👉 Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && !isLast) next();
    else if (distance < -minSwipeDistance && !isFirst) prev();
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

        <div className="actions">
          {isAdmin && (
            <button
              className="btn-outline"
              onClick={() => router.push("/dashboard-selector")}
            >
              Back to Projects
            </button>
          )}

          <button
            className="btn-outline"
            onClick={() =>
              router.push(`/project-details/${projectId}`)
            }
          >
            Project Details
          </button>

          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <h2 className="title">{projectId} Updates</h2>

      {loading && (
        <div className="dashboard-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {Object.entries(groupedFiles).map(([month, days]) => (
        <div key={month}>

          {/* 🔥 MONTH HEADER */}
          <div className="sticky-header">
            {month}
          </div>

          {/* 🔥 DAYS */}
          {Object.entries(days).map(([day, items]) => (
            <div key={day}>

              {/* 🔥 DATE LABEL */}
              <div className="date-divider">
                {day}
              </div>

              <div className="grid">
                {items.map((item) => {
                  const index = files.indexOf(item);
                  const isVideo = item.fileUrl?.includes(".mp4");

                  return (
                    <div
                      key={item.id}
                      className="card"
                      onClick={() => setSelectedIndex(index)}
                    >
                      {isVideo ? (
                        <video src={item.fileUrl} />
                      ) : (
                        <img
                          src={item.fileUrl}
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      ))}

      {!loading && files.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No updates yet</h3>
          <p>Project updates will appear here once uploaded</p>
        </div>
      )}

      {/* MODAL (UNCHANGED) */}
      {selectedIndex !== null && files[selectedIndex] && (
        <div
          className="modal"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="modal-content gallery"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!isFirst && (
              <button className="nav left" onClick={prev}>‹</button>
            )}

            {files[selectedIndex]?.fileUrl?.includes(".mp4") ? (
              <video src={files[selectedIndex]?.fileUrl} controls autoPlay />
            ) : (
              <img src={files[selectedIndex]?.fileUrl} />
            )}

            {!isLast && (
              <button className="nav right" onClick={next}>›</button>
            )}

            <button
              className="close-btn"
              onClick={() => setSelectedIndex(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}