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

const ViewBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          const res = await fetch(
            `https://vzrhvh9tm4.execute-api.eu-west-1.amazonaws.com/dev/getBookingById?booking_id=${id}`
          );
          const data = await res.json();
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
  try {
    const res = await fetch(
      "https://vzrhvh9tm4.execute-api.eu-west-1.amazonaws.com/dev/updateBookingStatus",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          booking_id: id, 
          user_id: booking.user_id,
          status 
        }),
      }
    );
    const data = await res.json();
    console.log("Updated booking:", data);
    alert("Booking status updated successfully!");
    navigate("/bookings");
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

  return (
    <Paper sx={{ p: 4, maxWidth: 600, margin: "20px auto" }} elevation={3}>
            {/* Back button */}
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
          <b>Created At:</b> {booking.date_of_booking}
        </Typography>

        <FormControl fullWidth>
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

        <Button variant="contained" color="primary" onClick={updateStatus}>
          Update Status
        </Button>
      </Stack>
    </Paper>
  );
};

export default ViewBooking;
