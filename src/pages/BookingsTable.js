import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';
import '../css/BookingsTable.css';

const statusColors = {
  confirmed: 'status-pill status-confirmed',
  pending: 'status-pill status-pending',
  cancelled: 'status-pill status-cancelled',
  completed: 'status-pill status-completed',
};

const BookingsTable = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    groupName: '',
    service: '',
    date: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 9;

  // Fetch data from backend

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Get current session
        const session = await fetchAuthSession({ bypassCache: false });
        const token = session.tokens.idToken.toString();

        const res = await fetch(
          "https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/getAllBookings",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        const formatted = data.bookings.map((b) => {
          const rawStatus = b.status ? String(b.status) : 'unknown';
          return {
            id: b.booking_id,
            groupName: b.user_id || 'N/A',
            service: b.service_type || 'N/A',
            date: b.date_of_booking
              ? new Date(b.date_of_booking).toISOString().split('T')[0]
              : 'N/A',
            groupSize: b.group_size ? `${b.group_size} people` : 'N/A',
            total: b.total_price ? `$${Number(b.total_price).toLocaleString()}` : '$0',
            status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
          };
        });

        setBookings(formatted);

      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);



  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchGroup =
        filters.groupName === '' ||
        b.groupName.toLowerCase().includes(filters.groupName.toLowerCase());
      const matchService =
        filters.service === '' ||
        b.service.toLowerCase().includes(filters.service.toLowerCase());
      const matchDate = filters.date === '' || b.date === filters.date;
      return matchGroup && matchService && matchDate;
    });
  }, [filters, bookings]);

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, currentPage]);

  const handleNewBooking = () => {
    navigate('/add-booking');
  };
  const handleView = (bookingId) => {
    navigate(`/booking/${bookingId}`);
  };
  const handleExport = () => {
    navigate('/export-bookings');

  }

  if (loading) {
    return <div className="bookings-container">Loading bookings...</div>;
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>Recent Bookings</h2>
        <div>
          <button className="button export-btn" onClick={handleExport}>Export</button>
          <button className="button new-booking-btn" onClick={handleNewBooking}>
            + New Booking
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <input
          placeholder="Filter by Group"
          value={filters.groupName}
          onChange={(e) => setFilters({ ...filters, groupName: e.target.value })}
        />
        <input
          placeholder="Filter by Service"
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
      </div>

      {/* Bookings Table */}
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.groupName}</td>
              <td>{booking.service}</td>
              <td>{booking.date}</td>
              <td>{booking.groupSize}</td>
              <td>{booking.total}</td>
              <td>
                <span
                  className={statusColors[booking.status.toLowerCase()] || 'status-pill'}
                >
                  {booking.status}
                </span>
              </td>
              <td className="action-buttons">
                <button className="view-btn" onClick={() => handleView(booking.id)}>View</button>
                {/* {booking.status.toLowerCase() !== 'completed' && (
                  <button className="edit-btn">Download</button>
                )} */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingsTable;
