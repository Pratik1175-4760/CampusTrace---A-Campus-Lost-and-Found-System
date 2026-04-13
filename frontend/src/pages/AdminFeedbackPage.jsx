import { useEffect, useState } from "react";
import { TOKEN_STORAGE_KEY } from "../store/adminStore.js";
import "../components/styles/AdminFeedbackPage.css";

const AdminFeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY)}`,
  });

  const fetchFeedback = async (status = "all") => {
    setLoading(true);
    setError("");
    try {
      const url = status === "all" ? "/api/feedback" : `/api/feedback?status=${status}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch feedback");

      setFeedbackList(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/feedback/stats/overview", {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const updateFeedbackStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      fetchFeedback(filterStatus === "all" ? "all" : filterStatus);
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete feedback");

      fetchFeedback(filterStatus === "all" ? "all" : filterStatus);
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchFeedback(status === "all" ? "all" : status);
  };

  return (
    <div className="admin-feedback-container">
      <h1>Feedback Management</h1>

      {error && <div className="error-alert">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalFeedback}</div>
            <div className="stat-label">Total Feedback</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.byStatus.find((s) => s._id === "pending")?.count || 0}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.byStatus.find((s) => s._id === "resolved")?.count || 0}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      )}

      <div className="filter-buttons">
        <button
          className={filterStatus === "all" ? "active" : ""}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        <button
          className={filterStatus === "pending" ? "active" : ""}
          onClick={() => handleFilterChange("pending")}
        >
          Pending
        </button>
        <button
          className={filterStatus === "reviewed" ? "active" : ""}
          onClick={() => handleFilterChange("reviewed")}
        >
          Reviewed
        </button>
        <button
          className={filterStatus === "resolved" ? "active" : ""}
          onClick={() => handleFilterChange("resolved")}
        >
          Resolved
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : feedbackList.length === 0 ? (
        <div className="no-feedback">No feedback found.</div>
      ) : (
        <div className="feedback-list">
          {feedbackList.map((feedback) => (
            <div key={feedback._id} className="feedback-item">
              <div className="feedback-header">
                <div className="feedback-title">
                  <h3>{feedback.name}</h3>
                  <span className="category-badge">{feedback.category}</span>
                  <span className="rating-display">
                    {"★".repeat(feedback.rating)}
                    {"☆".repeat(5 - feedback.rating)}
                  </span>
                </div>
                <span className={`status-badge ${feedback.status}`}>
                  {feedback.status}
                </span>
              </div>
              <p className="feedback-email">{feedback.email}</p>
              <p className="feedback-message">{feedback.message}</p>
              <div className="feedback-footer">
                <span className="feedback-date">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
                <div className="action-buttons">
                  {feedback.status !== "resolved" && (
                    <button
                      className="btn-status"
                      onClick={() =>
                        updateFeedbackStatus(
                          feedback._id,
                          feedback.status === "pending" ? "reviewed" : "resolved"
                        )
                      }
                    >
                      {feedback.status === "pending" ? "Mark Reviewed" : "Resolve"}
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => deleteFeedback(feedback._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPage;
