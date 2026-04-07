import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Modal from './Modal';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';

export default function DeleteCrop({ cropId, onClose }) {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [confirmStep, setConfirmStep] = useState(0);

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(`/crops/legacy/${cropId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete the crop. Please try again.');
      setDone(true);
    } catch (deleteError) {
      setError(deleteError.message || 'Server busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirm-overlay">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      {done ? (
        <Card className="confirm-card">
          <>
            <h3>Deleted</h3>
            <p>The crop has been removed successfully.</p>
            <Button className="full-width" onClick={() => navigate('/view-crop')}>View My Crops</Button>
          </>
        </Card>
      ) : null}

      <Modal
        isOpen={!done && confirmStep === 1}
        title="Delete Crop"
        message="This crop will be removed from the marketplace and its pending request chain will be cleared."
        onClose={() => setConfirmStep(0)}
        secondaryAction={{
          label: 'Cancel',
          onClick: onClose,
        }}
        primaryAction={{
          label: 'Continue',
          onClick: () => setConfirmStep(2),
        }}
      />
      <Modal
        isOpen={!done && confirmStep === 2}
        title="Final Confirmation"
        message="Please confirm once more. This crop will be deleted from your active listings."
        onClose={onClose}
        secondaryAction={{
          label: 'Back',
          onClick: () => setConfirmStep(1),
        }}
        primaryAction={{
          label: loading ? 'Deleting...' : 'Delete Crop',
          onClick: async () => {
            await handleDelete();
            setConfirmStep(0);
          },
        }}
      />
    </div>
  );
}
