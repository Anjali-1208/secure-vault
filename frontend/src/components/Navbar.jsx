import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div>
        <Link to="/dashboard">Dashboard</Link>
        {user.role === "admin" && <Link to="/audit">Audit log</Link>}
      </div>
      <div>
        <span className="badge">{user.role}</span>{" "}
        <span style={{ marginRight: 16 }}>{user.name}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
