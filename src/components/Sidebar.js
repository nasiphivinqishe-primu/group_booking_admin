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
        <Link to="/account">Account</Link>
      </div>
    </div>
  );
}

export default Sidebar;
