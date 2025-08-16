import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingsTable from './pages/BookingsTable';
import AddBooking from './pages/AddBooking';
import AnalyticsReports from './pages/AdminAnalytics';
import CancellationLogsPage from './pages/CancellationLogsPage';
import ConfigurePolicies from './pages/ConfigurePolicies';
import Sidebar from './components/Sidebar';
import ViewBooking from './pages/ViewBooking';


function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: '220px', padding: '20px', width: '100%' }}>
          <Routes>
            <Route path="/" element={<BookingsTable />} />
            <Route path="/add-booking" element={<AddBooking />} />
            <Route path="/analytics" element={<AnalyticsReports />} />
            <Route path="/cancellation-logs" element={<CancellationLogsPage />} />
            <Route path="/configure-policies" element={<ConfigurePolicies />} />
            <Route path="/booking/:id" element={<ViewBooking />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
