import React, { useEffect, useState } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";

import "../css/CancellationLogs.css";

const CancellationLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    date: "",
    user: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const session = await fetchAuthSession({ bypassCache: false });
        const token = session.tokens.idToken.toString();

        const res = await fetch(
          "https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/getCancelledAndRescheduledBookings",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch logs: ${res.status}`);
        }

        const data = await res.json();
        const bookings = data.bookings || [];
        
        const mappedLogs = bookings.map((b, index) => ({
          id: b.id || index,
          user: b.user_id || "Unknown",
          action: b.status === "cancelled" ? "cancelled" : "rescheduled",
          date: b.date || new Date().toISOString().slice(0, 10),
          reason: b.reason || "N/A",
        }));

        setLogs(mappedLogs);
        setFilteredLogs(mappedLogs);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    if (filters.type !== "all") {
      filtered = filtered.filter((log) => log.action === filters.type);
    }

    if (filters.date) {
      filtered = filtered.filter((log) => log.date === filters.date);
    }

    if (filters.user) {
      filtered = filtered.filter((log) =>
        log.user.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [filters, logs]);

  return (
    <div className="logs-container">
      <h2 className="logs-header">Admin Cancellation/Reschedule Logs</h2>

      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <input
          type="text"
          placeholder="Search by user..."
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
        />
      </div>

      {loading ? (
        <p>Loading logs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredLogs.length === 0 ? (
        <p>No logs found for the selected filters.</p>
      ) : (
        filteredLogs.map((log) => (
          <div className="log-card" key={log.id}>
            <p>
              <strong>User:</strong> {log.user}
            </p>
            <p>
              <strong>Action:</strong>{" "}
              <span
                className={
                  log.action === "cancelled"
                    ? "log-type-cancelled"
                    : "log-type-rescheduled"
                }
              >
                {log.action.toUpperCase()}
              </span>
            </p>
            <p>
              <strong>Date:</strong> {log.date}</p>
            <p>
              <strong>Reason:</strong> {log.reason}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default CancellationLogsPage;
