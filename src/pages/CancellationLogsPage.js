import React, { useEffect, useState } from "react";
import "../css/CancellationLogs.css";

const sampleLogs = [
  {
    id: 1,
    user: "John Doe",
    action: "cancelled",
    date: "2025-08-07",
    reason: "User unavailable",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "rescheduled",
    date: "2025-08-06",
    reason: "Client requested new time",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "cancelled",
    date: "2025-08-05",
    reason: "Weather issues",
  },
    {
    id: 4,
    user: "Mike Mikes",
    action: "cancelled",
    date: "2025-08-05",
    reason: "Payment not received",
  },
];

const CancellationLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    date: "",
    user: "",
  });

  useEffect(() => {
    // In production, fetch logs from your backend here.
    setLogs(sampleLogs);
    setFilteredLogs(sampleLogs);
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

      {filteredLogs.length === 0 ? (
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
              <strong>Date:</strong> {log.date}
            </p>
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
