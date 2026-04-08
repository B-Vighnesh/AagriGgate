import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Modal from './Modal';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';

export default function DeleteCrop({ cropId: cropIdProp, onClose }) {
  const navigate = useNavigate();
  const { cropId: cropIdParam } = useParams();
  const cropId = cropIdProp || cropIdParam;
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [confirmStep, setConfirmStep] = useState(1);

  useEffect(() => {
    setConfirmStep(1);
  }, [cropId]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(-1);
  };

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
      setConfirmStep(1);
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

      {!done && error ? (
        <Card className="confirm-card">
          <h3>Unable to Delete Crop</h3>
          <p>{error}</p>
          <div className="confirm-actions">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button variant="danger" onClick={() => setConfirmStep(1)}>Try Again</Button>
          </div>
        </Card>
      ) : null}

      <Modal
        isOpen={!done && !error && confirmStep === 1}
        title="Delete Crop"
        message="This crop will be removed from the marketplace and its pending request chain will be cleared."
        onClose={() => setConfirmStep(0)}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleClose,
        }}
        primaryAction={{
          label: 'Continue',
          onClick: () => setConfirmStep(2),
        }}
      />
      <Modal
        isOpen={!done && !error && confirmStep === 2}
        title="Final Confirmation"
        message="Please confirm once more. This crop will be deleted from your active listings."
        onClose={handleClose}
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
