import React, { useEffect, useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getCurrentUser, fetchAuthSession, signOut } from "@aws-amplify/auth";
import "./App.css";

import BookingsTable from "./pages/BookingsTable";
import AddBooking from "./pages/AddBooking";
import AnalyticsReports from "./pages/AdminAnalytics";
import CancellationLogsPage from "./pages/CancellationLogsPage";
import ConfigurePolicies from "./pages/ConfigurePolicies";
import Sidebar from "./components/Sidebar";
import ViewBooking from "./pages/ViewBooking";
import ExportBookings from "./pages/ExportBookings";

const components = {
  SignIn: {
    Header() {
      return (
        <div className="login-header">
          <h2>PrimU Admin Login</h2>
          <img
            src="https://primu-test-bucket.s3.eu-west-1.amazonaws.com/images/primU_logo.png"
            alt="Prim-U Logo"
          />
        </div>
      );
    },
  },
};

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload || {};

        setUserEmail(payload.email || user.signInDetails?.loginId || "Unknown");
        setGroups(payload["cognito:groups"] || []);
      } catch (err) {
        console.error("Error fetching user session:", err);
      }
    }

    fetchUser();
  }, []);

  if (!userEmail) {
    return <div className="loading">Loading...</div>;
  }

  if (!groups.includes("Admin")) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
        <button onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <header className="top-header">
            <div>
              <h2>Hi, {userEmail}</h2>
              <p>Welcome to the PrimU admin dashboard</p>
            </div>

            <button className="logout-btn" onClick={signOut}>
              Logout
            </button>
          </header>

          <main className="page-content">
            <Routes>
              <Route path="/" element={<BookingsTable />} />
              <Route path="/add-booking" element={<AddBooking />} />
              <Route path="/analytics" element={<AnalyticsReports />} />
              <Route path="/cancellation-logs" element={<CancellationLogsPage />} />
              <Route path="/configure-policies" element={<ConfigurePolicies />} />
              <Route path="/booking/:id" element={<ViewBooking />} />
              <Route path="/export-bookings" element={<ExportBookings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default withAuthenticator(App, {
  hideSignUp: true,
  components,
});