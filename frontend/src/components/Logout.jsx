import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { clearAuth } from '../lib/auth';

export default function Logout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const confirmFinalLogout = async () => {
    setLoading(true);
    clearAuth();
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <section className="page page--center logout-page">
      <Card className="logout-card">
        {step === 1 ? (
          <>
            <h2>Confirm Logout</h2>
            <p>Do you really want to logout from AagriGgate?</p>
            <div className="logout-actions">
              <Button variant="danger" onClick={() => setStep(2)}>Yes, Continue</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <h2>Final Confirmation</h2>
            <p>This will clear your current session. Are you absolutely sure?</p>
            <div className="logout-actions">
              <Button variant="danger" loading={loading} onClick={confirmFinalLogout}>
                {loading ? 'Logging out...' : 'Yes, Logout Now'}
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>Go Back</Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
