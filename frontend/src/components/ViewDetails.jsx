import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import DeleteCrop from './DeleteCrop';
import ApproachFarmer from './ApproachFarmer';

const LEAF_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23d8f3dc" width="100" height="100"/><text y="60" x="50" text-anchor="middle" font-size="40">🌾</text></svg>';

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-xs font-semibold w-32 shrink-0 pt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

export default function ViewDetails() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const role = getRole();
  const currentUserId = getFarmerId();

  const [cropDetails, setCropDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(null);
  const [approachStatus, setApproachStatus] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [infoAlert, setInfoAlert] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    Promise.all([
      // Crop details
      apiFetch(`/crops/crop/${cropId}`, { method: 'GET' }),
      // Crop image
      apiFetch(`/crops/viewUrl/${cropId}`, { method: 'GET' }),
    ])
      .then(async ([detailsRes, imgRes]) => {
        if (!detailsRes.ok) {
          setError('This crop has been removed by the farmer.');
          setTimeout(() => navigate(-1), 1200);
          return;
        }
        const details = await detailsRes.json();
        setCropDetails(details);

        if (imgRes.ok) {
          const blob = await imgRes.blob();
          setImageUrl(URL.createObjectURL(blob));
        }

        // Fetch requests count (farmer view)
        if (role === 'farmer') {
          apiFetch(`/seller/approach/requests/farmer/${currentUserId}/${cropId}`, { method: 'GET' })
            .then(r => r.ok ? r.json() : [])
            .then(data => setRequests(Array.isArray(data) ? data.length : 0))
            .catch(() => setRequests(0));
        }

        // Fetch approach status (buyer view)
        if (role === 'buyer') {
          apiFetch(`/buyer/approach/requests/user/${currentUserId}/${cropId}`, { method: 'GET' })
            .then(r => r.ok ? r.json() : null)
            .then(status => {
              setApproachStatus(status);
              if (status === true) setInfoAlert('Farmer accepted your request! Check your email for next steps.');
              if (status === false) setInfoAlert('You already made a request for this crop. It is pending review.');
            })
            .catch(() => { });
        }
      })
      .catch(() => {
        setError('Failed to load crop details. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [cropId]);

  if (loading) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  if (error) return (
    <div className="page-wrapper text-center py-16">
      <p className="text-3xl mb-3">⚠️</p>
      <p style={{ color: 'var(--color-error)' }}>{error}</p>
    </div>
  );

  if (!cropDetails) return null;

  const isFarmerOwner = role === 'farmer' && cropDetails.farmer?.farmerId === currentUserId;

  return (
    <div className="page-wrapper max-w-5xl mx-auto">
      <button
        className="flex items-center gap-2 text-sm mb-5 font-medium"
        style={{ color: 'var(--color-primary)' }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Info Alert (approach status) */}
      {infoAlert && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          <span>ℹ️ {infoAlert}</span>
          <button onClick={() => setInfoAlert(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="card overflow-hidden h-72 md:h-auto">
          <img
            src={imageUrl || LEAF_PLACEHOLDER}
            alt={cropDetails.cropName}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.src = LEAF_PLACEHOLDER; }}
          />
        </div>

        {/* Details */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
              {cropDetails.cropName}
            </h1>
            <span className="badge badge-green">{cropDetails.cropType}</span>
          </div>

          <div className="flex-1">
            <DetailRow label="Farmer" value={`${cropDetails.farmer?.firstName || ''} ${cropDetails.farmer?.lastName || ''}`} />
            <DetailRow label="Region" value={cropDetails.region} />
            <DetailRow label="Description" value={cropDetails.description} />
            <DetailRow label="Quantity" value={`${cropDetails.quantity} ${cropDetails.unit}`} />
            <DetailRow label="Added" value={cropDetails.postDate} />
            {isFarmerOwner && requests !== null && (
              <DetailRow label="Requests" value={`${requests} buyer request${requests !== 1 ? 's' : ''}`} />
            )}
          </div>

          {/* Price */}
          <div className="mt-4 py-3 px-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Market Price</p>
            <p className="text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
              ₹{cropDetails.marketPrice?.toFixed(2)}
              <span className="text-base font-medium ml-1" style={{ color: 'var(--color-text-muted)' }}>/ {cropDetails.unit}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2">
            {role === 'buyer' && approachStatus !== true && (
              <button className="btn-primary py-3" onClick={() => setShowApproachModal(true)}>
                🤝 Approach Farmer
              </button>
            )}

            {isFarmerOwner && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-outline" onClick={() => navigate(`/update-crop/${cropId}`)}>✏️ Edit Crop</button>
                  <button className="btn-outline" onClick={() => navigate(`/view-approaches/farmer/${cropDetails.farmer?.farmerId}/crop/${cropId}`)}>
                    📨 View Requests
                  </button>
                </div>
                <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>🗑 Delete Crop</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteCrop cropId={cropId} onClose={() => setShowDeleteModal(false)} />
      )}

      {/* Approach Modal */}
      {showApproachModal && (
        <ApproachFarmer
          cropId={cropId}
          farmerId={cropDetails.farmer?.farmerId}
          userId={currentUserId}
          onClose={() => setShowApproachModal(false)}
        />
      )}
    </div>
  );
}
