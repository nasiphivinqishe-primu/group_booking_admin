import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ConfigurePolicies.css';

function ConfigurePolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState({
    cutoffTime: '',
    refundPercentage: '',
    refundNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPolicies((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (policies.cutoffTime < 0) {
      alert('Cutoff time cannot be negative.');
      return false;
    }
    if (policies.refundPercentage < 0 || policies.refundPercentage > 100) {
      alert('Refund percentage must be between 0 and 100.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log('Saved Policies:', policies);
    // TODO: Send to backend API
    navigate('/');
  };

  return (
    <div className="policies-container">
      <div className="policies-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 
        </button>
        <h2>Configure Policies</h2>
      </div>

      <form className="policies-form" onSubmit={handleSubmit}>
        <label>Cutoff Time (hours before booking)</label>
        <input
          type="number"
          name="cutoffTime"
          value={policies.cutoffTime}
          onChange={handleChange}
          required
        />

        <label>Refund Percentage (%)</label>
        <input
          type="number"
          name="refundPercentage"
          value={policies.refundPercentage}
          onChange={handleChange}
          required
        />

        <label>Refund Notes / Rules</label>
        <textarea
          name="refundNotes"
          value={policies.refundNotes}
          onChange={handleChange}
          rows="4"
        />

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Policies
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfigurePolicies;
