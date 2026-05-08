import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import DeleteCrop from './DeleteCrop';
import ApproachFarmer from './ApproachFarmer';
import Modal from './Modal';
import { apiFetch } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import { addFavorite, addToCart, getFavoriteStatus, removeFavorite } from '../api/buyerToolsApi';
import { createOrGetChatConversation } from '../api/chatApi';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="%23d8f3dc"/><text x="50%" y="55%" text-anchor="middle" font-size="28" fill="%231f6f54">Crop</text></svg>';

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="view-details-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getApproachStatusValue(approachStatus) {
  if (approachStatus && typeof approachStatus === 'object') {
    return approachStatus.status;
  }
  return approachStatus;
}

function getApproachIdValue(approachStatus) {
  if (approachStatus && typeof approachStatus === 'object') {
    return approachStatus.approachId
      ?? approachStatus.approachID
      ?? approachStatus.approach_id
      ?? approachStatus.id
      ?? null;
  }
  return null;
}

function normalizeApproachStatus(approachStatus) {
  const status = getApproachStatusValue(approachStatus);
  if (typeof status === 'boolean') {
    return status ? 'accepted' : 'pending';
  }
  if (status == null) return '';
  return String(status).trim().toLowerCase();
}

function getApproachInfoAlert(status) {
  const normalized = normalizeApproachStatus(status);
  switch (normalized) {
    case 'accepted':
    case 'active':
      return 'Farmer accepted your request. Check your chats for next steps.';
    case 'pending':
      return 'You already requested this crop. It is pending review.';
    case 'completed':
      return 'Deal was completed once for this crop.';
    case 'failed':
    case 'rejected':
      return 'Deal was failed once for this crop.';
    case 'expired':
      return 'Deal was expired once for this crop.';
    default:
      return '';
  }
}

export default function ViewDetails() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const role = getRole();
  const token = getToken();
  const currentUserId = getFarmerId();

  const [cropDetails, setCropDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState(null);
  const [approachStatus, setApproachStatus] = useState(null);
  const [infoAlert, setInfoAlert] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState('1');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [approachPromptOpen, setApproachPromptOpen] = useState(false);
  const [approachActionLoading, setApproachActionLoading] = useState(false);
  const approachPromptShownRef = useRef(false);

  const safeFetch = (path, options = {}) => apiFetch(path, options);

  const parseJsonIfPresent = async (response) => {
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const detailRes = await safeFetch(`/crops/legacy/${cropId}`, { method: 'GET' });
        const imgRes = await safeFetch(`/crops/legacy/${cropId}/image`, { method: 'GET' });
        if (!detailRes.ok) throw new Error('This crop is not available.');
        const detailData = await parseJsonIfPresent(detailRes);
        if (!detailData.cropID) throw new Error('This crop is not available.');

        if (!mounted) return;
        setCropDetails(detailData);

        if (imgRes.ok) {
          const blob = await imgRes.blob();
          if (mounted) setImageUrl(URL.createObjectURL(blob));
        }

        if (role === 'farmer') {
          const reqRes = await safeFetch(`/seller/approach/requests/me/${cropId}`, { method: 'GET' });
          if (reqRes.ok) {
            const reqData = await parseJsonIfPresent(reqRes);
            if (mounted) {
              const total = Number(reqData?.totalElements || reqData?.content?.length || 0);
              setRequests(total);
            }
          }
        }

        if (role === 'buyer') {
          try {
            const favorite = await getFavoriteStatus(cropId);
            if (mounted) setIsFavorite(Boolean(favorite));
          } catch {
            // ignore favorite status load errors
          }
          const statusRes = await safeFetch(`/buyer/approach/requests/me/${cropId}`, { method: 'GET' });
          if (statusRes.ok) {
            const status = await parseJsonIfPresent(statusRes);
            if (!mounted) return;
            setApproachStatus(status);
            setInfoAlert(getApproachInfoAlert(status));
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load crop details.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (imageUrl) {
        try { URL.revokeObjectURL(imageUrl); } catch { /* ignore */ }
      }
    };
  }, [cropId]);

  useEffect(() => {
    if (loading || role !== 'buyer' || approachPromptShownRef.current) return;
    const status = normalizeApproachStatus(approachStatus);
    if (status === 'pending' || status === 'accepted' || status === 'active') {
      approachPromptShownRef.current = true;
      setApproachPromptOpen(true);
    }
  }, [approachStatus, loading, role]);

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (error) {
    const isUnavailable = error.toLowerCase().includes('not available');
    return (
      <section className="page page--center">
        <Card className="narrow-card text-center">
          <h3>{isUnavailable ? 'Crop Unavailable' : 'Unable to load crop details'}</h3>
          <p className="error-text">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </section>
    );
  }

  if (!cropDetails) return null;

  const isOwner = role === 'farmer' && cropDetails.ownedByCurrentUser === true;
  const isSold = (cropDetails.status || '').toLowerCase() === 'sold';
  const normalizedApproachStatus = normalizeApproachStatus(approachStatus);
  const approachId = getApproachIdValue(approachStatus);
  const canViewApproachDetails = Boolean(approachId);
  const hasOpenApproach = ['pending', 'accepted', 'active', 'completed'].includes(normalizedApproachStatus);
  const approachButtonLabel = normalizedApproachStatus === 'pending'
    ? 'Request Pending'
    : normalizedApproachStatus === 'completed'
      ? 'Deal Completed'
      : normalizedApproachStatus === 'accepted' || normalizedApproachStatus === 'active'
        ? 'Request Accepted'
        : 'Send Request';

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  const handleFavoriteToggle = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(cropId);
        setIsFavorite(false);
        showToast('Removed from favorites.', 'info');
      } else {
        await addFavorite(cropId);
        setIsFavorite(true);
        showToast('Saved to favorites.', 'success');
      }
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to update favorites.', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      await addToCart({ cropId: Number(cropId), quantity: Number(requestedQuantity || 1) });
      showToast('Added to cart.', 'success');
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to add crop to cart.', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  const handleApproachButtonClick = () => {
    if (['pending', 'accepted', 'active'].includes(normalizedApproachStatus)) {
      setApproachPromptOpen(true);
      return;
    }
    setShowApproachModal(true);
  };

  const handleTrackRequest = () => {
    if (!approachId) {
      showToast('Request details are not available yet. Please refresh and try again.', 'info');
      return;
    }
    setApproachPromptOpen(false);
    navigate(`/requests/${approachId}`);
  };

  const handleOpenAcceptedChat = async () => {
    if (!approachId) {
      showToast('Chat is not available yet. Please refresh and try again.', 'info');
      return;
    }
    setApproachActionLoading(true);
    try {
      const conversation = await createOrGetChatConversation(approachId);
      setApproachPromptOpen(false);
      navigate(`/chat/${conversation.conversationId}`);
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to open chat right now.', 'error');
    } finally {
      setApproachActionLoading(false);
    }
  };

  return (
    <section className="page view-details-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <button
                    type="button"
                    className="chat-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <i className="fa-solid fa-chevron-left" />
          </button>

        {infoAlert ? <p className="view-details-alert">{infoAlert}</p> : null}

        <div className="view-details-grid">
          <Card className="view-details-image-card">
            <img src={imageUrl || PLACEHOLDER} alt={cropDetails.cropName} onError={(event) => { event.currentTarget.src = PLACEHOLDER; }} />
          </Card>

          <Card className="view-details-info-card">
            <div className="view-details-title-row">
              <h1>{cropDetails.cropName}</h1>
              <span>{cropDetails.cropType}</span>
            </div>

            <DetailRow label="Farmer" value={cropDetails.farmerName} />
            <DetailRow label="Region" value={cropDetails.region} />
            <DetailRow label="Status" value={cropDetails.status} />
            <DetailRow label="Urgent Sale" value={cropDetails.isUrgent ? 'Yes' : 'No'} />
            <DetailRow label="Waste Sale" value={cropDetails.isWaste ? 'Yes' : 'No'} />
            {cropDetails.discountPrice ? (
              <DetailRow label="Discount Price" value={`Rs ${Number(cropDetails.discountPrice).toFixed(2)}`} />
            ) : null}
            <DetailRow label="Description" value={cropDetails.description} />
            <DetailRow label="Quantity" value={`${cropDetails.quantity} ${cropDetails.unit}`} />
            <DetailRow label="Added" value={cropDetails.postDate} />
            {isOwner && requests !== null ? (
              <DetailRow label="Requests" value={`${requests} buyer request${requests !== 1 ? 's' : ''}`} />
            ) : null}

            <div className="view-details-price-box">
              <p>Market Price</p>
              <h2>Rs {Number(cropDetails.marketPrice || 0).toFixed(2)} <small>/ {cropDetails.unit}</small></h2>
            </div>

            {role === 'buyer' ? (
              <Card className="buyer-detail-actions">
                <div className="buyer-detail-actions__head">
                  <h3>Buyer Actions</h3>
                  <p>Save this listing for later or move it to your cart before sending the final request.</p>
                </div>
                <div className="buyer-detail-actions__grid">
                  <div className="buyer-detail-actions__buttons">
                    <Button variant="outline" onClick={handleFavoriteToggle} loading={favoriteLoading}>
                      {isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
                    </Button>
                    <Button onClick={handleAddToCart} loading={cartLoading} disabled={isSold}>
                      {isSold ? 'Sold Out' : 'Add to Cart'}
                    </Button>
                    {canViewApproachDetails ? (
                      <Button variant="outline" onClick={() => navigate(`/requests/${approachId}`)}>
                        View Request
                      </Button>
                    ) : null}
                    <Button variant="accent" onClick={handleApproachButtonClick} disabled={isSold || normalizedApproachStatus === 'completed'}>
                      {approachButtonLabel}
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/cart')}>Open Cart</Button>
                  </div>
                </div>
              </Card>
            ) : null}

            <div className="view-details-actions">
              {isOwner ? (
                <>
                  <Button variant="outline" onClick={() => navigate(`/update-crop/${cropId}`)}>Update Crop</Button>
                  <Button variant="outline" onClick={() => navigate(`/view-approaches/farmer/${currentUserId}/crop/${cropId}`)}>View Requests</Button>
                  <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Crop</Button>
                </>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      {showDeleteModal ? <DeleteCrop cropId={cropId} onClose={() => setShowDeleteModal(false)} /> : null}
      {showApproachModal ? (
        <ApproachFarmer
          cropId={cropId}
          initialQuantity={Number(requestedQuantity || 1)}
          onClose={() => setShowApproachModal(false)}
          onSuccess={(quantity, latestApproach) => {
            approachPromptShownRef.current = true;
            setApproachStatus(latestApproach || { status: 'Pending' });
            setInfoAlert('Your request is pending review from the farmer.');
            showToast('Approach request sent.', 'success');
          }}
        />
      ) : null}
      <Modal
        isOpen={approachPromptOpen}
        title={normalizedApproachStatus === 'pending' ? 'Request Pending' : 'Request Accepted'}
        message={
          normalizedApproachStatus === 'pending'
            ? 'Your request is pending with the farmer. Track the request to see the latest status.'
            : 'Your request is accepted. Start the conversation with the farmer to continue the deal.'
        }
        onClose={() => setApproachPromptOpen(false)}
        secondaryAction={{
          label: normalizedApproachStatus === 'pending' ? 'Close' : 'View Request',
          onClick: normalizedApproachStatus === 'pending'
            ? () => setApproachPromptOpen(false)
            : handleTrackRequest,
        }}
        primaryAction={{
          label: normalizedApproachStatus === 'pending'
            ? 'Track Request'
            : approachActionLoading
              ? 'Opening...'
              : 'Open Chat',
          onClick: normalizedApproachStatus === 'pending' ? handleTrackRequest : handleOpenAcceptedChat,
        }}
      />
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
