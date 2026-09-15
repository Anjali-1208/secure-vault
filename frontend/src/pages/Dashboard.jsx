import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  async function loadFiles() {
    try {
      const { data } = await api.get("/files");
      setFiles(data.files);
    } catch (err) {
      setError("Could not load files");
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset the file input
    }
  }

  async function handleDownload(file) {
    try {
      const res = await api.get(`/files/${file._id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Download failed");
    }
  }

  async function handleDelete(file) {
    if (!confirm(`Delete "${file.originalName}"?`)) return;
    try {
      await api.delete(`/files/${file._id}`);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  }

  const canDelete = (file) => user.role === "admin" || file.owner?._id === user.id || file.owner === user.id;

  return (
    <div className="container">
      <div className="card">
        <h2>Upload a file</h2>
        <p style={{ color: "#666", fontSize: 14 }}>
          The file is encrypted with AES-256 on the server before it ever touches the database.
        </p>
        <input type="file" onChange={handleUpload} disabled={uploading} />
        {error && <div className="error">{error}</div>}
      </div>

      <div className="card">
        <h2>{user.role === "employee" ? "Your files" : "All files"}</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f._id}>
                <td>{f.originalName}</td>
                <td>{f.owner?.name || "—"}</td>
                <td>{(f.size / 1024).toFixed(1)} KB</td>
                <td>{new Date(f.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDownload(f)}>Download</button>{" "}
                  {canDelete(f) && (
                    <button className="danger" onClick={() => handleDelete(f)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr><td colSpan="5" style={{ color: "#888" }}>No files yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
