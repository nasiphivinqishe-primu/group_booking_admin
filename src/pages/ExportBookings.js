import React, { useState, useEffect } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import "../css/ExportBookings.css";

// Utility: Convert array of objects to CSV string
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((field) => `"${row[field] ?? ""}"`).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
};

const ExportBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const session = await fetchAuthSession({ bypassCache: false });
        const token = session.tokens.idToken.toString(); // <-- use this

        const res = await fetch(
          "https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/getAllBookings",
          {
            method: "GET",
            headers: {
              "Authorization": token,
              "Content-Type": "application/json",
            },
          }
        );
        
        const data = await res.json();

        console.log(data)

        const formatted = data.bookings.map((b) => ({
          id: b.booking_id,
          groupName: b.user_id || 'N/A',
          service: b.service_type || 'N/A',
          date: b.date_of_booking
            ? new Date(b.date_of_booking).toISOString().split('T')[0]
            : 'N/A',
          groupSize: b.group_size ? `${b.group_size} people` : 'N/A',
          total: b.amount_paid ? `$${Number(b.amount_paid).toLocaleString()}` : '$0',
          status: b.status ? String(b.status) : 'unknown',
        }));

        setBookings(formatted);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Download as CSV
  const handleDownloadCSV = () => {
    if (!bookings.length) {
      alert("No bookings available to download.");
      return;
    }

    const csv = convertToCSV(bookings);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `primu_bookings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Send bookings via email (placeholder)
  const handleSendEmail = async () => {
    try {
      console.log("Sending bookings via email:", bookings);
      alert("Bookings will be sent via email (Lambda integration coming soon).");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  if (loading) return <div>Loading bookings...</div>;

  return (
    <div className="export-container">
      <h2>Export Bookings</h2>
      <p>You can either download all bookings as a CSV file or send them via email.</p>

      <div className="export-actions">
        <button className="button" onClick={handleDownloadCSV}>
          Download CSV
        </button>
        <button className="button" onClick={handleSendEmail}>
          Send via Email
        </button>
      </div>

      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User ID</th>
            <th>Service</th>
            <th>Date of Booking</th>
            <th>Status</th>
            <th>Date Cancelled</th>
            <th>Date Completed</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.groupName}</td>
              <td>{b.service}</td>
              <td>{b.date}</td>
              <td>{b.groupSize}</td>
              <td>{b.amount_paid}</td>
              <td>{b.status}</td>
              <td>{b.date_cancelled ? new Date(b.date_cancelled).toLocaleString() : "-"}</td>
              <td>{b.date_completed ? new Date(b.date_completed).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExportBookings;
