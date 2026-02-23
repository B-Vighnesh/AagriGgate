import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getApiBaseUrl } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';

export default function DeleteCrop({ cropId, onClose }) {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/crops/legacy/${cropId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
      <Card className="confirm-card">
        <ValidateToken farmerId={farmerId} token={token} role={role} />

        {!done ? (
          <>
            <h3>Delete Crop</h3>
            <p>This action is permanent. Are you sure you want to delete this crop?</p>

            {error ? <p className="settings-error">{error}</p> : null}

            <div className="confirm-actions">
              <Button variant="danger" loading={loading} onClick={handleDelete}>Yes, Delete</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <h3>Deleted</h3>
            <p>The crop has been removed successfully.</p>
            <Button className="full-width" onClick={() => navigate('/view-crop')}>View My Crops</Button>
          </>
        )}
      </Card>
    </div>
  );
}
