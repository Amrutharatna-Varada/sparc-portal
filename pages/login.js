import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);

            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            // 🔥 Fetch user role
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                alert("User not found");
                return;
            }

            const data = userDoc.data();

            if (data.role === "admin") {
                router.push("/admin");
            } else {
                // client → go to their project dashboard
                router.push(`/dashboard/${data.projectId}`);
            }

        } catch (err) {
            alert("Login failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                {/* BRAND */}
                <div className="login-header">

  <div className="brand-row">
    <div className="logo-wrapper">
  <img src="/logo-sp.jpeg" className="logo-img" />
</div>
    <h1 className="brand-title">SP Portal</h1>
  </div>

  <p className="login-sub">
    Access your project dashboard
  </p>

</div>

                {/* INPUTS */}
                <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* BUTTON */}
                <button
                    className="login-btn"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </button>

            </div>
        </div>
    );
}