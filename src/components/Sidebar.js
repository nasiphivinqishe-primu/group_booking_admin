// Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '@aws-amplify/auth';
import '../css/Sidebar.css';

function Sidebar({ userEmail }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/'); // redirect to login page
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-nav">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">View Bookings</Link>
        </li>
        <li className={location.pathname === '/analytics' ? 'active' : ''}>
          <Link to="/analytics">Analytics</Link>
        </li>
        <li className={location.pathname === '/cancellation-logs' ? 'active' : ''}>
          <Link to="/cancellation-logs">Cancellation Logs</Link>
        </li>
        <li className={location.pathname === '/configure-policies' ? 'active' : ''}>
          <Link to="/configure-policies">Configure Policies</Link>
        </li>
      </ul>

      <div className="account-section">
        <hr />
        {/* <Link to="/account">Account</Link> */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#f4701a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
