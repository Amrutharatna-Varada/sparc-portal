import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Admin() {
  const router = useRouter();
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return router.push("/");

    const q = query(
      collection(db, "users"),
      where("email", "==", user.email)
    );

    const snap = await getDocs(q);

    if (snap.empty || snap.docs[0].data().role !== "admin") {
      router.push("/");
    }
  });

  return () => unsub();
}, []);

  return (
    <div className="admin-container">

      <div className="admin-header">
        <div className="brand">
          <div className="logo-box">SP</div>
          <span>SPARC Portal</span>
        </div>

        <button className="btn-outline" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>

      <div className="admin-grid">

        <div className="admin-card" onClick={() => router.push("/upload")}>
          📤
          <h3>Upload Files</h3>
          <p>Add new project updates</p>
        </div>

        <div className="admin-card" onClick={() => router.push("/uploads")}>
          📁
          <h3>Manage Uploads</h3>
          <p>Edit / Delete uploads</p>
        </div>

        <div className="admin-card" onClick={() => router.push("/dashboard-selector")}>
            📊
          <h3>View Client Dashboard</h3>
          <p>Access project dashboards</p>
        </div>

      </div>
    </div>
  );
}