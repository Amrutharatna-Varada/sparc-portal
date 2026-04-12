"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const logoutAndRedirect = async () => {
      try {
        await signOut(auth); // 🔥 force logout
      } catch (err) {
        console.log("Already logged out");
      }

      router.replace("/login"); // 🚀 always go login
    };

    logoutAndRedirect();
  }, []);

  return null;
}