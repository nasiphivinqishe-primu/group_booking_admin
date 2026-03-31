import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
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
  Divider,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ViewBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const session = await fetchAuthSession({ bypassCache: false });
        const token = session.tokens.idToken.toString();

        const url = `https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/getBookingById?booking_id=${encodeURIComponent(id)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

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
  }, [id]);

  const updateStatus = async () => {
    try {
      const session = await fetchAuthSession({ bypassCache: false });
      const token = session.tokens.idToken.toString();

      const res = await fetch(
        "https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/updateBookingStatus",
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: id,
            user_id: booking.user_id,
            status,
          }),
        }
      );

      const data = await res.json();
      console.log("Updated booking:", data);
      alert("Booking status updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking status");
    }
  };

  const DetailRow = ({ label, value }) => (
    <Typography>
      <b>{label}:</b> {value ?? "-"}
    </Typography>
  );

  if (!booking) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: "20px auto" }} elevation={3}>
      <IconButton onClick={() => navigate("/")}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6">Booking Overview</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DetailRow label="Reference" value={booking.reference} />
              <DetailRow label="Booking ID" value={booking.booking_id} />
              <DetailRow label="Service Type" value={booking.service_type} />
              <DetailRow label="Date" value={booking.date_of_booking} />
              <DetailRow label="Time" value={booking.booking_time} />
            </Grid>
            <Grid item xs={12} md={6}>
              <DetailRow label="Location" value={booking.location} />
              <DetailRow label="Session Number" value={booking.session_number} />
              <DetailRow label="Total Sessions" value={booking.total_sessions} />
              <DetailRow label="Status" value={booking.status} />
              <DetailRow label="Payment Status" value={booking.payment_status} />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6">Contact Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow label="Name" value={booking.contact?.name} />
          <DetailRow label="Email" value={booking.contact?.email} />
          <DetailRow label="Phone" value={booking.contact?.phone} />
        </Box>

        <Box>
          <Typography variant="h6">Company Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow label="Company Name" value={booking.company_json?.companyName} />
          <DetailRow label="Company Contact Name" value={booking.company_json?.contactName} />
          <DetailRow label="Company Contact Email" value={booking.company_json?.contactEmail} />
          <DetailRow label="Billing Address" value={booking.company_json?.billingAddress} />
          <DetailRow label="Registration Number" value={booking.company_json?.regNumber} />
          <DetailRow label="VAT Number" value={booking.company_json?.vatNumber} />
          <DetailRow label="PO Number" value={booking.company_json?.poNumber} />
        </Box>

        <Box>
          <Typography variant="h6">Payment Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow label="Total Price" value={`R ${booking.total_price ?? 0}`} />
          <DetailRow label="Amount Paid" value={`R ${booking.amount_paid ?? 0}`} />
          <DetailRow label="Amount Remaining" value={`R ${booking.amount_remaining ?? 0}`} />
          <DetailRow label="Deposit Paid" value={booking.deposit_paid ? "Yes" : "No"} />
        </Box>

        <Box>
          <Typography variant="h6">Groups</Typography>
          <Divider sx={{ mb: 2 }} />
          {booking.groups && booking.groups.length > 0 ? (
            booking.groups.map((group, index) => (
              <Paper key={group.groupId || index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography><b>Group ID:</b> {group.groupId}</Typography>
                <Typography><b>Guest Count:</b> {group.guestCount}</Typography>
                <Typography><b>Selected Treatments:</b></Typography>
                {group.selectedTreatments && group.selectedTreatments.length > 0 ? (
                  <ul>
                    {group.selectedTreatments.map((treatment, i) => (
                      <li key={i}>
                        {typeof treatment === "string"
                          ? treatment
                          : treatment.name || JSON.stringify(treatment)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>-</Typography>
                )}
              </Paper>
            ))
          ) : (
            <Typography>No group data available.</Typography>
          )}
        </Box>

        <Box>
          <Typography variant="h6">Update Status</Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
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
              <MenuItem value="paid">PAID</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={updateStatus}>
            Update Status
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ViewBooking;