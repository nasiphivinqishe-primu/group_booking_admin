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

// Custom UI overrides
const components = {
  SignIn: {
    Header() {
      return (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h2 style={{ marginBottom: 10 }}>PrimU Admin Login</h2>
          <img
            src="https://primu-test-bucket.s3.eu-west-1.amazonaws.com/images/primU_logo.png"
            alt="Prim-U Logo"
            style={{ maxWidth: "200px", height: "auto" }}
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
        // First get the user
        const user = await getCurrentUser();
        // Then fetch tokens/session
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
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  if (!groups.includes("admins")) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
        <button
          onClick={async () => {
            await signOut();
          }}
          style={{ padding: "6px 12px" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <header
        style={{
          display: "flex",
          justifyContent: "center", // horizontally center welcome message
          alignItems: "center",
          padding: "10px 20px",
          background: "#f9f4fe",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h3>Welcome, {userEmail}</h3>
      </header>
      <div style={{ display: "flex" }}>
        <div style={{ marginLeft: "220px", padding: "20px", width: "100%" }}>
          <Router>
            <Sidebar />
            <Routes>
              <Route path="/" element={<BookingsTable />} />
              <Route path="/add-booking" element={<AddBooking />} />
              <Route path="/analytics" element={<AnalyticsReports />} />
              <Route path="/cancellation-logs" element={<CancellationLogsPage />} />
              <Route path="/configure-policies" element={<ConfigurePolicies />} />
              <Route path="/booking/:id" element={<ViewBooking />} />
              <Route path="/export-bookings" element={<ExportBookings />} />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App, {
  hideSignUp: true,
  components,
});
