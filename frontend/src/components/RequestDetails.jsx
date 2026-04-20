import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getRole } from '../lib/auth';
import { requestJson } from '../lib/api';

const STATUS_CLASS = {
  pending: 'user-requests-status--pending',
  accepted: 'user-requests-status--accepted',
  rejected: 'user-requests-status--rejected',
  completed: 'user-requests-status--completed',
};

export default function RequestDetails() {
  const { approachId } = useParams();
  const navigate = useNavigate();
  const role = getRole();
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const path = role === 'farmer'
          ? `/seller/approach/requests/${approachId}`
          : `/buyer/approach/requests/${approachId}`;
        const data = await requestJson(path, { method: 'GET' });
        if (!active) return;
        setRequestDetails(data || null);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load request details.', type: 'error' });
        setRequestDetails(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [approachId, role]);

  const counterpartLabel = useMemo(() => (
    role === 'farmer' ? 'Buyer' : 'Farmer'
  ), [role]);

  const counterpartName = role === 'farmer'
    ? requestDetails?.userName
    : requestDetails?.farmerName;

  const statusText = requestDetails?.status || 'Pending';

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (!requestDetails) {
    return (
      <section className="page ntf-detail-page">
        <div className="ag-container ntf-detail-wrap">
          <Card className="ntf-detail-card ntf-detail-card--empty">
            <h1>Request not found</h1>
            <p>This request may have been deleted or is no longer available for your account.</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </Card>
        </div>
        <Toast message={toast.message} type={toast.type} />
      </section>
    );
  }

  return (
    <section className="page ntf-detail-page">
      <div className="ag-container ntf-detail-wrap">
        <Card className="ntf-detail-card request-detail-card">
          <div className="ntf-detail-head">
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <span className={`user-requests-status ${STATUS_CLASS[(requestDetails.status || '').toLowerCase()] || ''}`}>
              {statusText}
            </span>
          </div>

          <div className="ntf-detail-content request-detail-content">
            <div className="request-detail-hero">
              <div className="request-detail-hero__copy">
                <span className="request-detail-hero__eyebrow">Request Details</span>
                <h1>{requestDetails.cropName}</h1>
                <p>Review the buyer request, requested quantity, and crop context in one place.</p>
              </div>

              <div className="request-detail-hero__chips">
                <span className="request-detail-chip">
                  <span>Request</span>
                  <strong>#{requestDetails.approachId}</strong>
                </span>
                <span className="request-detail-chip">
                  <span>{counterpartLabel}</span>
                  <strong>{counterpartName || 'Not available'}</strong>
                </span>
                <span className="request-detail-chip">
                  <span>Quantity</span>
                  <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                </span>
              </div>
            </div>

            <div className="ntf-detail-grid request-detail-grid">
              <div className="ntf-detail-stat request-detail-stat request-detail-stat--emphasis">
                <span>Requested Quantity</span>
                <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                <small>Units requested in this approach.</small>
              </div>
              <div className="ntf-detail-stat request-detail-stat">
                <span>{counterpartLabel}</span>
                <strong>{counterpartName || 'Not available'}</strong>
                <small>The person connected to this request.</small>
              </div>
              <div className="ntf-detail-stat request-detail-stat">
                <span>Crop</span>
                <strong>{requestDetails.cropName}</strong>
                <small>The listing this request belongs to.</small>
              </div>
              <div className="ntf-detail-stat request-detail-stat">
                <span>Status</span>
                <strong>{statusText}</strong>
                <small>Current request decision.</small>
              </div>
            </div>

            <div className="ntf-detail-actions request-detail-actions">
              <Button onClick={() => navigate(`/view-details/${requestDetails.cropId}`)}>View Crop</Button>
            </div>
          </div>
        </Card>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
