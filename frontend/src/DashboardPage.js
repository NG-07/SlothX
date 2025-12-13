import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const DashboardPage = ({ userEmail, onEdit }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) fetchLoans();
  }, [userEmail]);

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/my-applications?email=${userEmail}`);
      setLoans(res.data);
    } catch (err) {
      alert("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return '#10B981'; // Green
    if (status === 'Rejected') return '#EF4444'; // Red
    return '#F59E0B'; // Orange (Submitted)
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-box">
        <h1 className="dashboard-title">Your Dashboard 📊</h1>
        <p>Manage your applications and track status in real-time.</p>
      </div>
      
      {loading ? <div className="loading-spinner">Loading your data...</div> : (
        loans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No applications yet</h3>
            <p>Start your financial journey with SlothX today.</p>
          </div>
        ) : (
          <div className="loans-grid">
            {loans.map((loan) => (
              <div key={loan.id} className="loan-card-premium">
                <div className="card-top">
                  <span className="loan-badge" style={{backgroundColor: getStatusColor(loan.status)}}>{loan.status}</span>
                  <span className="loan-date">{new Date(loan.application_date).toLocaleDateString()}</span>
                </div>
                
                <h3 className="card-purpose">{loan.loan_purpose} Loan</h3>
                <h2 className="card-amount">₹ {parseInt(loan.loan_amount).toLocaleString()}</h2>
                
                <div className="card-details-mini">
                    <p><span>Tenure:</span> {loan.tenure_months} Months</p>
                    <p><span>ID:</span> #{loan.id}</p>
                </div>
                
                <button className="edit-btn-premium" onClick={() => onEdit(loan)}>
                  ✏️ Edit Application
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default DashboardPage;