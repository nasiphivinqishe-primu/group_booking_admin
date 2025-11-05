import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchAuthSession } from "@aws-amplify/auth";

const ViewBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          const session = await fetchAuthSession({ bypassCache: false });
          const token = session.tokens.idToken.toString();

          const res = await fetch(
            `https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/getBookingById?booking_id=${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

          const data = await res.json();
          console.log(data)
          if (data.bookings && data.bookings.length > 0) {
            setBooking(data.bookings[0]);
            setStatus(data.bookings[0].status || "");
          } else {
            console.warn("Booking not found");
          }
        } catch (err) {
          console.error("Error fetching booking:", err);
        }
      };

      fetchBooking();
    }
  }, [id]);

  const updateStatus = async () => {
    // Prevent updates if the booking is already cancelled or completed
    if (booking.status === "cancelled" || booking.status === "completed") {
      alert("This booking cannot be updated because it is already cancelled or completed.");
      return;
    }

    try {
      const session = await fetchAuthSession({ bypassCache: false });
      const token = session.tokens.idToken.toString();

      const updatePayload = {
        booking_id: id,
        user_id: booking.user_id,
        status,
      };

      if (status === "cancelled") {
        updatePayload.date_cancelled = new Date().toISOString();
      } else if (status === "completed") {
        updatePayload.date_completed = new Date().toISOString();
      }

      const res = await fetch(
        "https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/updateBookingStatus",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("Updated booking:", data);
      alert("Booking status updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking status");
    }
  };


  if (!booking)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  const isStatusLocked = booking.status === "cancelled" || booking.status === "completed";

  return (
    <Paper sx={{ p: 4, maxWidth: 600, margin: "20px auto" }} elevation={3}>
      <IconButton onClick={() => navigate("/")}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>

      <Stack spacing={2}>
        <Typography>
          <b>Booking ID:</b> {booking.booking_id}
        </Typography>
        <Typography>
          <b>User ID:</b> {booking.user_id}
        </Typography>
        <Typography>
          <b>Service:</b> {booking.service_type}
        </Typography>
        <Typography>
          <b>Date Of Booking:</b> {booking.date_of_booking}
        </Typography>
        <Typography>
          <b>Created At:</b>{" "}
          {new Date(booking.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          }).replace(/\s/g, " ")}
        </Typography>

        <FormControl fullWidth disabled={isStatusLocked}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="pending">PENDING</MenuItem>
            <MenuItem value="confirmed">CONFIRMED</MenuItem>
            <MenuItem value="cancelled">CANCELLED</MenuItem>
            <MenuItem value="completed">COMPLETED</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={updateStatus}
          disabled={isStatusLocked}
        >
          {isStatusLocked ? "Status cannot be updated" : "Update Status"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ViewBooking;
