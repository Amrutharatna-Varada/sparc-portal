import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Header({ title, right }) {
  return (
    <div className="header">

      <div className="brand">
        <div className="logo-box">SP</div>
        <span>SPARC Portal</span>
      </div>

      <h3 className="page-title">{title}</h3>

      <div className="header-actions">
        {right}
        <button className="btn" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>

    </div>
  );
}