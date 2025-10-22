import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';

function AddBooking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',                  // string
    group_size: '',               // string, will convert to number on submit
    service_type: '',             // string
    date_of_booking: '',          // string, initialized!
    booking_time: '',             // string
    price: '',                    // string, will convert to number
    number_of_sessions: '',       // string, will convert to number
    alternate_contact: '',        // string
    service_provider: '',         // string
    status: 'pending'             // string
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        booking_id: uuidv4(),
        group_size: Number(formData.group_size),
        price: Number(formData.price),
        number_of_sessions: Number(formData.number_of_sessions),
        alternate_contact: formData.alternate_contact || null,
        service_provider: formData.service_provider || null,
        cancellation_date: null
      };

      console.log(payload);

      const res = await fetch(
        'https://zr1psnorg6.execute-api.eu-west-1.amazonaws.com/dev/bookings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error('Failed to save booking');

      navigate('/');
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Error saving booking');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h5">Add New Booking</Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Group Name"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Service Type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              type="number"
              label="Group Size"
              name="group_size"
              value={formData.group_size}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              type="date"
              label="Date of Booking"
              name="date_of_booking"
              value={formData.date_of_booking}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="time"
              label="Booking Time"
              name="booking_time"
              value={formData.booking_time}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              type="number"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              type="number"
              label="Number of Sessions"
              name="number_of_sessions"
              value={formData.number_of_sessions}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Alternate Contact"
              name="alternate_contact"
              value={formData.alternate_contact}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Service Provider"
              name="service_provider"
              value={formData.service_provider}
              onChange={handleChange}
              fullWidth
            />

            <Button type="submit" variant="contained" color="primary">
              Save Booking
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default AddBooking;
