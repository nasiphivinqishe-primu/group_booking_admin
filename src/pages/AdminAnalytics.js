import "../css/AdminAnalytics.css";
import React, { useState, useMemo, useEffect } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";

import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

const AnalyticsReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [bookingsData, setBookingsData] = useState([]);

  // Fetch bookings from backend
useEffect(() => {
  const fetchBookings = async () => {
    try {
      // ✅ Get Cognito session and ID token
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
      if (!res.ok) {
        console.error("Failed:", res.status);
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setBookingsData(data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  fetchBookings();
}, []);

  // Helper: get date range for current period
  const getDateRange = (period) => {
    if (period === "all") return [null, null];
    const now = new Date();
    const days = period === "7d" ? 7 : 30;

    const end = new Date(now);
    const start = new Date(now);
    start.setDate(now.getDate() - days);

    return [start, end];
  };

  // Current + previous period ranges
  const [currentStart, currentEnd] = getDateRange(selectedPeriod);
  const [prevStart, prevEnd] =
    currentStart && currentEnd
      ? [
          new Date(currentStart.getTime() - (currentEnd - currentStart)),
          currentStart,
        ]
      : [null, null];

  // Filtered bookings for current + previous
  const currentBookings = useMemo(() => {
    return bookingsData.filter((b) => {
      if (!currentStart || !currentEnd) return true;
      const d = new Date(b.date_of_booking);
      return d >= currentStart && d <= currentEnd;
    });
  }, [bookingsData, currentStart, currentEnd]);

  const previousBookings = useMemo(() => {
    return bookingsData.filter((b) => {
      if (!prevStart || !prevEnd) return false;
      const d = new Date(b.date_of_booking);
      return d >= prevStart && d <= prevEnd;
    });
  }, [bookingsData, prevStart, prevEnd]);

  // Metrics calculation helper
  const calcChange = (current, previous) => {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Total revenue
  const totalRevenue = currentBookings.reduce(
    (sum, b) => sum + (parseFloat(b.total_price) || 0),
    0
  );
  const prevRevenue = previousBookings.reduce(
    (sum, b) => sum + (parseFloat(b.total_price) || 0),
    0
  );
  const revenueChange = calcChange(totalRevenue, prevRevenue);

  // Total bookings
  const totalBookings = currentBookings.length;
  const prevBookings = previousBookings.length;
  const bookingsChange = calcChange(totalBookings, prevBookings);

  // Average group size
  const averageGroupSize =
    currentBookings.length > 0
      ? (
          currentBookings.reduce(
            (sum, b) => sum + (parseInt(b.group_size) || 0),
            0
          ) / currentBookings.length
        ).toFixed(1)
      : 0;

  const prevGroupSize =
    previousBookings.length > 0
      ? (
          previousBookings.reduce(
            (sum, b) => sum + (parseInt(b.group_size) || 0),
            0
          ) / previousBookings.length
        ).toFixed(1)
      : 0;

  const groupSizeChange = calcChange(averageGroupSize, prevGroupSize);

  // Conversion rate
  const confirmedBookings = currentBookings.filter(
    (b) => b.status && b.status.toLowerCase() === "confirmed"
  ).length;

  const prevConfirmed = previousBookings.filter(
    (b) => b.status && b.status.toLowerCase() === "confirmed"
  ).length;

  const conversionRate =
    totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0;

  const prevConversion =
    prevBookings > 0 ? ((prevConfirmed / prevBookings) * 100).toFixed(1) : 0;

  const conversionChange = calcChange(conversionRate, prevConversion);

  // Bookings per service
  const services = [
    ...new Set(currentBookings.map((b) => b.service_type || "Unknown")),
  ];
  const bookingsPerService = services.map(
    (service) => currentBookings.filter((b) => b.service_type === service).length
  );

  // Line chart data
  const lineChartData = useMemo(() => {
    const dateCounts = {};

    currentBookings.forEach((b) => {
      const date = new Date(b.date_of_booking).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const labels = Object.keys(dateCounts);
    const data = Object.values(dateCounts);

    return {
      labels,
      datasets: [
        {
          label: "Bookings Over Time",
          data,
          fill: false,
          borderColor: "#36A2EB",
        },
      ],
    };
  }, [currentBookings]);

  // Pie chart data
  const pieChartData = {
    labels: services,
    datasets: [
      {
        label: "Service Distribution",
        data: bookingsPerService,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Dashboard Overview</h2>
        <select
          className="analytics-select"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Cards */}
      <div className="analytics-cards">
        <div className="analytics-card highlight bookings">
          <div className="card-icon">📘</div>
          <div>
            <p className="card-label">Total Bookings</p>
            <p className="card-value">{totalBookings}</p>
            <p
              className={`card-subtext ${bookingsChange >= 0 ? "positive" : "negative"}`}
            >
              {bookingsChange >= 0 ? `+${bookingsChange}%` : `${bookingsChange}%`} from last period
            </p>
          </div>
        </div>

        <div className="analytics-card highlight revenue">
          <div className="card-icon">💰</div>
          <div>
            <p className="card-label">Total Revenue</p>
            <p className="card-value">${totalRevenue.toLocaleString()}</p>
            <p
              className={`card-subtext ${revenueChange >= 0 ? "positive" : "negative"}`}
            >
              {revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`} from last period
            </p>
          </div>
        </div>

        <div className="analytics-card highlight group-size">
          <div className="card-icon">👥</div>
          <div>
            <p className="card-label">Avg Group Size</p>
            <p className="card-value">{averageGroupSize}</p>
            <p
              className={`card-subtext ${groupSizeChange >= 0 ? "positive" : "negative"}`}
            >
              {groupSizeChange >= 0 ? `+${groupSizeChange}%` : `${groupSizeChange}%`} from last period
            </p>
          </div>
        </div>

        <div className="analytics-card highlight conversion">
          <div className="card-icon">⚡</div>
          <div>
            <p className="card-label">Conversion Rate</p>
            <p className="card-value">{conversionRate}%</p>
            <p
              className={`card-subtext ${conversionChange >= 0 ? "positive" : "negative"}`}
            >
              {conversionChange >= 0 ? `+${conversionChange}%` : `${conversionChange}%`} from last period
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <div className="analytics-chart-container">
          <div className="analytics-chart-header">
            <h3>Bookings Over Time</h3>
          </div>
          <Line data={lineChartData} />
        </div>

        <div className="analytics-chart-container">
          <h3 className="chart-title">Service Distribution</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
