import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';
import '../css/BookingsTable.css';

const statusColors = {
  confirmed: 'status-pill status-confirmed',
  pending: 'status-pill status-pending',
  cancelled: 'status-pill status-cancelled',
  completed: 'status-pill status-completed',
  paid: 'status-pill status-paid',
};

const BookingsTable = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [originalBookings, setOriginalBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    service: '',
    sortOrder: 'default',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 9;

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
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
            createdAt: b.created_at
              ? new Date(b.created_at).toISOString()
              : null,
            service: b.service_type || 'N/A',
            date: b.date_of_booking
              ? new Date(b.date_of_booking).toISOString().split('T')[0]
              : 'N/A',
            groupSize: b.group_size ? `${b.group_size} people` : 'N/A',
            total: b.total_price
              ? `$${Number(b.total_price).toLocaleString()}`
              : '$0',
            status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
          };
        });

        setBookings(formatted);
        setOriginalBookings(formatted);
      } catch (err) {
        console.error('❌ Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  //Extract unique services for dropdown
  const uniqueServices = useMemo(() => {
    const services = bookings.map((b) => b.service);
    return [...new Set(services)].filter((s) => s && s !== 'N/A');
  }, [bookings]);

  // Filter & Sort logic
const filteredBookings = useMemo(() => {
  let result = [...(filters.sortOrder === 'default' ? originalBookings : bookings)];

  // Filter by service
  if (filters.service) {
    result = result.filter((b) => b.service === filters.service);
  }

  // Sort only if latest/oldest
  if (filters.sortOrder === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (filters.sortOrder === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return result;
}, [filters, bookings, originalBookings]);


  //Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, currentPage]);

  //Handlers 
  const handleNewBooking = () => navigate('/add-booking');
  const handleView = (bookingId) => navigate(`/booking/${bookingId}`);
  const handleExport = () => navigate('/export-bookings');

  if (loading) return <div className="bookings-container">Loading bookings...</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>Recent Bookings</h2>
        <div>
          <button className="button export-btn" onClick={handleExport}>
            Export
          </button>
          <button className="button new-booking-btn" onClick={handleNewBooking} disabled>
            + New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        {/* Service Selector */}
        <select
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
        >
          <option value="">All Services</option>
          {uniqueServices.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>

        {/* Sort Selector */}
        <select
          value={filters.sortOrder}
          onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
        >
          <option value="default">Default</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        {/* Reset Filters Button */}
        <button
          className="reset-filters-btn"
          onClick={() => setFilters({ service: '', sortOrder: 'default' })}
        >
          Reset Filters
        </button>
      </div>

      {/* Bookings Table */}
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Group Name</th>
            <th>Created At</th>
            <th>Service</th>
            <th>Appointment Date</th>
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
              <td>
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })
                  : 'N/A'}
              </td>
              <td>{booking.service}</td>
              <td>{booking.date}</td>
              <td>{booking.groupSize}</td>
              <td>{booking.total}</td>
              <td>
                <span
                  className={
                    statusColors[booking.status.toLowerCase()] || 'status-pill'
                  }
                >
                  {booking.status}
                </span>
              </td>
              <td className="action-buttons">
                <button className="view-btn" onClick={() => handleView(booking.id)}>
                  View
                </button>
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
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingsTable;
