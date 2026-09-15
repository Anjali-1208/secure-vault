import { useEffect, useState } from "react";
import api from "../api/api";

const actionColors = {
  LOGIN_SUCCESS: "#dcfce7",
  LOGIN_FAILED: "#fee2e2",
  ACCOUNT_LOCKED: "#fee2e2",
  FILE_UPLOAD: "#e0e7ff",
  FILE_DOWNLOAD: "#e0e7ff",
  FILE_DELETE: "#fef3c7",
  ACCESS_DENIED: "#fee2e2",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/audit")
      .then((res) => setLogs(res.data.logs))
      .catch((err) => setError(err.response?.data?.message || "Could not load audit log"));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Audit log</h2>
        <p style={{ color: "#666", fontSize: 14 }}>
          Every login, upload, download, delete, and access-denied event across the system. Admin-only view.
        </p>
        {error && <div className="error">{error}</div>}
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>IP</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.userEmail}</td>
                <td>
                  <span className="badge" style={{ background: actionColors[log.action] || "#eee" }}>
                    {log.action}
                  </span>
                </td>
                <td>{log.ipAddress}</td>
                <td>{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="5" style={{ color: "#888" }}>No activity yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
