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

const SIDEBAR_WIDTH = 220;

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
        const user = await getCurrentUser();
        console.log("User basic info:", user);

        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload || {};

        console.log("ID token payload:", payload);

        setUserEmail(payload.email || user.signInDetails?.loginId || "Unknown");
        setGroups(payload["cognito:groups"] || []);

        console.log("Authenticated user email:", payload.email);
        console.log("User groups:", payload["cognito:groups"]);
      } catch (err) {
        console.error("Error fetching user session:", err);
      }
    }

    fetchUser();
  }, []);

  if (!userEmail) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  if (!groups.includes("Admin")) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
        <button
          onClick={async () => {
            await signOut();
          }}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#6a1b9a",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div
        className="App"
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
        }}
      >
        <Sidebar />

        <div
          style={{
            marginLeft: `${SIDEBAR_WIDTH}px`,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 24px",
              background: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              position: "sticky",
              top: 0,
              zIndex: 900,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  color: "#1f2937",
                }}
              >
                Hi, {userEmail}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Welcome to the PrimU admin dashboard
              </p>
            </div>

            <button
              onClick={async () => {
                await signOut();
              }}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#6a1b9a",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </header>

          <main
            style={{
              padding: "24px",
              flex: 1,
            }}
          >
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