import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CancelIcon from '@mui/icons-material/Cancel';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import '../css/Sidebar.css';

function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      
      {/* Header section */}
      <div className="sidebar-header">
        <img
          src="https://primu-test-bucket.s3.eu-west-1.amazonaws.com/images/primU_logo.png"
          alt="Prim-U Logo"
          className="sidebar-logo"
        />
        <h2 className="sidebar-title">Admin Panel</h2>
      </div>

      <ul className="sidebar-nav">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">
            <span className="sidebar-icon"><DashboardIcon /></span>
            <span className="sidebar-label">View Bookings</span>
          </Link>
        </li>

        <li className={location.pathname === '/analytics' ? 'active' : ''}>
          <Link to="/analytics">
            <span className="sidebar-icon"><AnalyticsIcon /></span>
            <span className="sidebar-label">Analytics</span>
          </Link>
        </li>

        <li className={location.pathname === '/cancellation-logs' ? 'active' : ''}>
          <Link to="/cancellation-logs">
            <span className="sidebar-icon"><CancelIcon /></span>
            <span className="sidebar-label">Cancellation Logs</span>
          </Link>
        </li>

        <li className={location.pathname === '/configure-policies' ? 'active' : ''}>
          <Link to="/configure-policies">
            <span className="sidebar-icon"><SettingsIcon /></span>
            <span className="sidebar-label">Configure Policies</span>
          </Link>
        </li>
      </ul>

      <div className="account-section">
        <Link
          to="/account"
          className={location.pathname === '/account' ? 'account-active' : ''}
        >
          <span className="sidebar-icon"><AccountCircleIcon /></span>
          <span className="sidebar-label">Account</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;