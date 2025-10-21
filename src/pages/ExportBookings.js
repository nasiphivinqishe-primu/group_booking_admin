import React, { useState, useEffect } from 'react';
import '../css/ExportBookings.css';

// Utility: Convert array of objects to CSV string
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((field) => `"${row[field] ?? ''}"`).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

const ExportBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("https://vzrhvh9tm4.execute-api.eu-west-1.amazonaws.com/dev/getAllBookings");
        const data = await res.json();
        const formatted = data.bookings.map((b) => ({
          id: b.booking_id,
          groupName: b.user_id || 'N/A',
          service: b.service_type || 'N/A',
          date: b.date_of_booking
            ? new Date(b.date_of_booking).toISOString().split('T')[0]
            : 'N/A',
          groupSize: b.group_size ? `${b.group_size} people` : 'N/A',
          total: b.price ? `$${Number(b.price).toLocaleString()}` : '$0',
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
    const csv = convertToCSV(bookings);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `primu_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Send bookings via email (placeholder)
  const handleSendEmail = async () => {
    try {
      // This will later call Lambda endpoint
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
        <button className="button" onClick={handleDownloadCSV}>Download CSV</button>
        <button className="button" onClick={handleSendEmail}>Send via Email</button>
      </div>

      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Group Name</th>
            <th>Service</th>
            <th>Date</th>
            <th>Group Size</th>
            <th>Total</th>
            <th>Status</th>
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
              <td>{b.total}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExportBookings;
