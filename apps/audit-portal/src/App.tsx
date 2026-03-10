import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [receiptId, setReceiptId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyReceipt = async () => {
    if (!receiptId.trim()) {
      setError('Please enter a receipt ID');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/audit/verify/${receiptId}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Failed to connect to verification service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 SecureVote - Public Audit Portal</h1>
        <p>Verify your vote receipt and view election transparency</p>
      </header>

      <main className="main">
        <section className="verify-section">
          <h2>Verify Vote Receipt</h2>
          <div className="verify-form">
            <input
              type="text"
              placeholder="Enter Receipt ID"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              className="receipt-input"
            />
            <button 
              onClick={verifyReceipt}
              disabled={loading}
              className="verify-button"
            >
              {loading ? 'Verifying...' : 'Verify Receipt'}
            </button>
          </div>

          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}

          {verificationResult && (
            <div className="verification-result">
              <h3>✅ Vote Verified Successfully!</h3>
              <div className="result-details">
                <div className="detail-row">
                  <span className="label">Receipt ID:</span>
                  <span className="value">{verificationResult.receiptId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Vote ID:</span>
                  <span className="value">{verificationResult.voteId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Block Number:</span>
                  <span className="value">{verificationResult.blockNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Transaction Hash:</span>
                  <span className="value small">{verificationResult.transactionHash}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Timestamp:</span>
                  <span className="value">{new Date(verificationResult.timestamp).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Constituency:</span>
                  <span className="value">{verificationResult.constituencyId}</span>
                </div>
              </div>
              <div className="blockchain-proof">
                <h4>🔗 Blockchain Proof</h4>
                <p>This vote is permanently recorded on the blockchain and cannot be altered.</p>
                <p>Your vote remains anonymous while being publicly verifiable.</p>
              </div>
            </div>
          )}
        </section>

        <section className="stats-section">
          <h2>📊 Election Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Votes</h3>
              <div className="stat-number">1,247</div>
            </div>
            <div className="stat-card">
              <h3>Constituencies</h3>
              <div className="stat-number">5</div>
            </div>
            <div className="stat-card">
              <h3>Turnout</h3>
              <div className="stat-number">68.3%</div>
            </div>
            <div className="stat-card">
              <h3>Verified Receipts</h3>
              <div className="stat-number">892</div>
            </div>
          </div>
        </section>

        <section className="transparency-section">
          <h2>🌐 Transparency Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔒 Anonymous Voting</h3>
              <p>Votes are encrypted and unlinkable to voter identity</p>
            </div>
            <div className="feature-card">
              <h3>🔍 Public Verification</h3>
              <p>Anyone can verify vote receipts on the blockchain</p>
            </div>
            <div className="feature-card">
              <h3>📊 Real-time Stats</h3>
              <p>Live election statistics and turnout data</p>
            </div>
            <div className="feature-card">
              <h3>⛓️ Immutable Records</h3>
              <p>Blockchain ensures votes cannot be altered</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>SecureVote - Blockchain-Based Electronic Voting System</p>
        <p>Ensuring election integrity through cryptographic transparency</p>
      </footer>
    </div>
  );
}

export default App;
