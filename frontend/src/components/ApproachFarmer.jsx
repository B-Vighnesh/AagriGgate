import React, { useState } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import { apiFetch } from '../lib/api';
import { getToken } from '../lib/auth';

export default function ApproachFarmer({ cropId, onClose }) {
  const token = getToken();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleApproach = async () => {
    if (!token) {
      setError('You are not logged in. Please log in first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(`/buyer/approach/create/${cropId}`, {
        method: 'POST',
        body: JSON.stringify({ quantity: Number(quantity || 1) }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to send request. You may have already requested this crop.');
      }

      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'Server busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approach-modal" role="dialog" aria-modal="true" aria-label="Approach farmer">
      <Card className="approach-modal__card">
        {!success && !error && (
          <>
            <h2>Approach Farmer</h2>
            <p>
              Confirm the quantity and send your request to the farmer for this crop.
            </p>
            <div className="buyer-detail-actions__qty">
              <label htmlFor="approachQuantity">Quantity</label>
              <input
                id="approachQuantity"
                type="number"
                min="1"
                step="0.1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="approach-modal__actions">
              <Button onClick={handleApproach} loading={loading}>Yes, Approach</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </>
        )}

        {success && (
          <>
            <h2>Request Sent</h2>
            <p>Your approach request was sent successfully.</p>
            <Button onClick={onClose}>Done</Button>
          </>
        )}

        {error && (
          <>
            <h2>Request Failed</h2>
            <p>{error}</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </>
        )}
      </Card>
    </div>
  );
}
