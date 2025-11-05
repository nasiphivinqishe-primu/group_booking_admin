// Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '@aws-amplify/auth';
import { useNotifications } from '../context/NotificationsContext';
import { Bell, List, BarChart2, Trash2, Settings, MessageCircle } from 'lucide-react';
import '../css/Sidebar.css';

function Sidebar({ userEmail }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

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
      <h2 className="sidebar-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://primu-test-bucket.s3.eu-west-1.amazonaws.com/images/Logomark_Primary+%26+White.svg"
            alt="Prim-U Logo"
            style={{ width: '32px', height: '32px' }}
          />
          <span>Admin Panel</span>
        </div>
      </h2>

      <ul className="sidebar-nav">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <List size={20} style={{ marginRight: '8px' }} />
            View Bookings
          </Link>
        </li>
        <li className={location.pathname === '/analytics' ? 'active' : ''}>
          <Link to="/analytics" style={{ display: 'flex', alignItems: 'center' }}>
            <BarChart2 size={20} style={{ marginRight: '8px' }} />
            Analytics
          </Link>
        </li>
        <li className={location.pathname === '/cancellation-logs' ? 'active' : ''}>
          <Link to="/cancellation-logs" style={{ display: 'flex', alignItems: 'center' }}>
            <Trash2 size={20} style={{ marginRight: '8px' }} />
            Cancellation Logs
          </Link>
        </li>
        <li className={location.pathname === '/configure-policies' ? 'active' : ''}>
          <Link to="/configure-policies" style={{ display: 'flex', alignItems: 'center' }}>
            <Settings size={20} style={{ marginRight: '8px' }} />
            Configure Policies
          </Link>
        </li>

        {/* Notifications */}
        <li className={location.pathname === '/notifications' ? 'active' : ''}>
          <Link to="/notifications" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Bell size={20} style={{ marginRight: '8px' }} />
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '8px',
                  height: '10px',
                  width: '10px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  border: '2px solid white',
                }}
              />
            )}
          </Link>
        </li>

        {/* Chats */}
        <li className={location.pathname === '/chats' ? 'active' : ''}>
          <Link to="/chats" style={{ display: 'flex', alignItems: 'center' }}>
            <MessageCircle size={20} style={{ marginRight: '8px' }} />
            Support Chats
          </Link>
        </li>
      </ul>

      <div className="account-section">
        <hr />
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
