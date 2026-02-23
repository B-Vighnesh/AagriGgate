import React, { useState } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import { getApiBaseUrl } from '../lib/api';
import { getToken, getFarmerId } from '../lib/auth';

export default function ApproachFarmer({ cropId, farmerId, onClose }) {
  const token = getToken();
  const currentUserId = getFarmerId();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleApproach = async () => {
    if (!token) {
      setError('You are not logged in. Please log in first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${getApiBaseUrl()}/buyer/approach/create/${farmerId}/${cropId}/${currentUserId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
              Are you sure you want to send an approach request to the farmer for this crop?
            </p>
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
