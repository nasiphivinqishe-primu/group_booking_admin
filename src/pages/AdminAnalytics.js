import "../css/AdminAnalytics.css"; 
import React, { useState, useMemo, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

const AnalyticsReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [bookingsData, setBookingsData] = useState([]);

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("https://vzrhvh9tm4.execute-api.eu-west-1.amazonaws.com/dev/getAllBookings");
        const data = await res.json();
        setBookingsData(data.bookings || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    fetchBookings();
  }, []);

  // Date threshold
  const getDateThreshold = () => {
    if (selectedPeriod === "all") return null;
    const now = new Date();
    const days = selectedPeriod === "7d" ? 7 : 30;
    return new Date(now.setDate(now.getDate() - days));
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    const threshold = getDateThreshold();
    if (!threshold) return bookingsData;
    return bookingsData.filter((b) => {
      const bookingDate = new Date(b.date_of_booking);
      return bookingDate >= threshold;
    });
  }, [selectedPeriod, bookingsData]);

  // Summary values
  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + (parseFloat(b.price) || 0),
    0
  );
  const totalBookings = filteredBookings.length;
  const averageGroupSize =
    filteredBookings.length > 0
      ? (
          filteredBookings.reduce(
            (sum, b) => sum + (parseInt(b.group_size) || 0),
            0
          ) / filteredBookings.length
        ).toFixed(1)
      : 0;
  const conversionRate = 68; // Placeholder until we have real data

  // Bookings per service
  const services = [...new Set(filteredBookings.map((b) => b.service_type || "Unknown"))];
  const bookingsPerService = services.map(
    (service) => filteredBookings.filter((b) => b.service_type === service).length
  );

  // Line chart data
  const lineChartData = useMemo(() => {
    const dateCounts = {};

    filteredBookings.forEach((b) => {
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
  }, [filteredBookings]);

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
            <p className="card-subtext positive">+12% from last period</p>
          </div>
        </div>

        <div className="analytics-card highlight revenue">
          <div className="card-icon">💰</div>
          <div>
            <p className="card-label">Total Revenue</p>
            <p className="card-value">${totalRevenue.toLocaleString()}</p>
            <p className="card-subtext positive">+8.5% from last period</p>
          </div>
        </div>

        <div className="analytics-card highlight group-size">
          <div className="card-icon">👥</div>
          <div>
            <p className="card-label">Avg Group Size</p>
            <p className="card-value">{averageGroupSize}</p>
            <p className="card-subtext negative">-2.1% from last period</p>
          </div>
        </div>

        <div className="analytics-card highlight conversion">
          <div className="card-icon">⚡</div>
          <div>
            <p className="card-label">Conversion Rate</p>
            <p className="card-value">{conversionRate}%</p>
            <p className="card-subtext positive">+4.2% from last period</p>
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
