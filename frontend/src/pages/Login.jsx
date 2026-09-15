import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // The backend intentionally sends a generic message so we don't leak
      // whether the email exists - display it exactly as received.
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 60 }}>
      <div className="card">
        <h2>SecureVault login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
        </form>
        <p style={{ fontSize: 13, color: "#666", marginTop: 16 }}>
          Demo accounts (after running <code>npm run seed</code>):<br />
          admin@demo.com / Admin@123<br />
          manager@demo.com / Manager@123<br />
          employee@demo.com / Employee@123
        </p>
      </div>
    </div>
  );
}
