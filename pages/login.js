import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
const [showPopup, setShowPopup] = useState(false);

const showError = (msg) => {
  setError(msg);
  setShowPopup(true);

  setTimeout(() => {
    setShowPopup(false);
  }, 3000); // auto hide
};

  const handleLogin = async () => {
    try {
      setError("");

      // 🔥 Basic validation
      if (!email || !password) {
        showError("Please enter email and password");
        return;
      }

      setLoading(true);

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        showError("User not found");
        return;
      }

      const data = userDoc.data();

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push(`/dashboard/${data.projectId}`);
      }

    } catch (err) {
      showError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
        <meta name="google-site-verification" content="google87adc8f0f582e95a.html" />
        {showPopup && (
  <div className="error-popup">
    {error}
  </div>
)}
      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <div className="brand-row">
            <div className="logo-wrapper">
              <img src="/logo-sp.jpeg" className="logo-img" />
            </div>
            <h1 className="brand-title">SP Portal</h1>
          </div>

          <p className="login-sub">Access your project dashboard</p>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD WITH ICON */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
        </div>

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