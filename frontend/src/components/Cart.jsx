import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import ApproachFarmer from './ApproachFarmer';
import { apiFetch } from '../lib/api';
import { checkoutCart, getCart, removeCartItem, updateCartItem } from '../api/buyerToolsApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const PAGE_SIZE = 10;
const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect fill="%23e7f4ee" width="360" height="220"/><rect fill="%23cfe7da" x="0" y="160" width="360" height="60"/><text x="180" y="118" font-family="Arial" font-size="24" text-anchor="middle" fill="%232a6e55">Crop Image</text></svg>';

export default function Cart() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [approachItem, setApproachItem] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  const showToast = (message, typeValue = 'info') => {
    setToast({ message, type: typeValue });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedSearch(search);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCart({
        page,
        size: PAGE_SIZE,
        keyword: appliedSearch,
        type,
        sortBy,
      });
      const nextItems = Array.isArray(data?.content) ? data.content : [];
      setItems(nextItems);
      setTotalPages(Number(data?.totalPages || 0));
      setQuantities(Object.fromEntries(nextItems.map((item) => [item.cartId, item.requestedQuantity ?? 1])));
      const imageEntries = await Promise.all(nextItems.map(async (item) => {
        try {
          const response = await apiFetch(`/crops/legacy/${item.cropId}/image`);
          if (!response.ok) return [item.cropId, ''];
          const blob = await response.blob();
          return [item.cropId, URL.createObjectURL(blob)];
        } catch {
          return [item.cropId, ''];
        }
      }));
      setImageUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) {
            try { URL.revokeObjectURL(url); } catch { /* ignore */ }
          }
        });
        return Object.fromEntries(imageEntries);
      });
    } catch (loadError) {
      setItems([]);
      setTotalPages(0);
      setError(loadError.message || 'Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (role !== 'buyer') {
      navigate('/404');
      return;
    }
    loadCart();
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url) {
          try { URL.revokeObjectURL(url); } catch { /* ignore */ }
        }
      });
    };
  }, [token, role, navigate, page, appliedSearch, type, sortBy]);

  const handleQuantitySave = async (cartId, quiet = false) => {
    setActionLoading(`save-${cartId}`);
    try {
      await updateCartItem({ cartId, quantity: Number(quantities[cartId]) });
      if (!quiet) {
        showToast('Cart quantity updated.', 'success');
      }
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to update quantity.', 'error');
      loadCart();
    } finally {
      setActionLoading('');
    }
  };

  const handleRemove = async (cartId) => {
    setActionLoading(`remove-${cartId}`);
    try {
      await removeCartItem(cartId);
      setItems((prev) => prev.filter((item) => item.cartId !== cartId));
      showToast('Removed from cart.', 'info');
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to remove cart item.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleCheckout = async () => {
    setActionLoading('checkout');
    try {
      const result = await checkoutCart();
      const successCount = Number(result?.successCount || 0);
      const failureCount = Number(result?.failureCount || 0);
      if (successCount > 0 && failureCount === 0) {
        showToast('Requests sent successfully.', 'success');
      } else if (successCount > 0) {
        showToast(`Sent ${successCount} request(s). ${failureCount} item(s) need attention.`, 'info');
      } else {
        showToast(result?.messages?.[0] || 'Unable to checkout cart.', 'error');
      }
      loadCart();
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to checkout cart.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleApproachFromCart = async () => {
    if (!approachItem) return;
    try {
      await removeCartItem(approachItem.cartId);
      setItems((prev) => prev.filter((item) => item.cartId !== approachItem.cartId));
      showToast('Approach sent and cart item removed.', 'success');
    } catch (errorValue) {
      showToast(errorValue.message || 'Approach was sent, but cart cleanup needs attention.', 'info');
      loadCart();
    } finally {
      setApproachItem(null);
    }
  };

  return (
    <section className="page buyer-tools-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />
      <div className="ag-container">
        <div className="buyer-tools-head">
          <div>
            <h1>Cart</h1>
            <p>Review the crops you plan to request and send them for farmer approval.</p>
          </div>
          <div className="buyer-tools-head__actions">
            <Button variant="outline" onClick={() => navigate('/favorites')}>Favorites</Button>
            <Button onClick={handleCheckout} loading={actionLoading === 'checkout'} disabled={items.length === 0}>Send Request</Button>
          </div>
        </div>

        <Card className="buyer-tools-toolbar">
          <input
            className="view-all-input"
            placeholder="Search cart by crop or farmer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="view-all-input" value={type} onChange={(event) => { setPage(0); setType(event.target.value); }}>
            <option value="all">All</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="waste">Waste</option>
            <option value="discount">Discount</option>
          </select>
          <select className="view-all-input" value={sortBy} onChange={(event) => { setPage(0); setSortBy(event.target.value); }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </Card>

        {loading ? (
          <div className="view-all-loading">
            <span className="ui-spinner ui-spinner--lg" />
            <span>Loading cart...</span>
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="view-all-empty">
            <p className="view-all-empty__title">{error}</p>
            <Button onClick={loadCart}>Retry</Button>
          </Card>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card className="view-all-empty">
            <p className="view-all-empty__title">Your cart is empty</p>
            <p className="view-all-empty__desc">Add crops from their detail page before sending a final request.</p>
            <Button onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
          </Card>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="buyer-tools-list">
            {items.map((item) => {
              const tone = item.isUrgent ? 'urgent' : item.isWaste ? 'waste' : 'normal';
              const handleOpen = () => navigate(`/view-details/${item.cropId}`);
              const handleKeyDown = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleOpen();
                }
              };
              return (
                <Card
                  key={item.cartId}
                  className={`buyer-tools-card buyer-tools-card--${tone}`}
                  onClick={handleOpen}
                  onKeyDown={handleKeyDown}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${item.cropName}`}
                >
                  <div className="buyer-tools-card__image-wrap">
                    <img
                      src={imageUrls[item.cropId] || IMAGE_PLACEHOLDER}
                      alt={item.cropName}
                      className="buyer-tools-card__image"
                      onError={(event) => { event.currentTarget.src = IMAGE_PLACEHOLDER; }}
                    />
                  </div>
                  <div className="buyer-tools-card__content">
                  <div className="buyer-tools-card__main">
                    <div>
                      <h3>{item.cropName}</h3>
                      <p>Farmer: <strong>{item.farmerName || 'N/A'}</strong> | Region: {item.region || 'N/A'}</p>
                    </div>
                    <div className="crop-flag-row">
                      {item.isUrgent ? <span className="crop-flag crop-flag--urgent">Urgent</span> : null}
                      {item.isWaste ? <span className="crop-flag crop-flag--waste">Waste</span> : null}
                      {item.discountPrice ? <span className="crop-flag crop-flag--discount">Discount</span> : null}
                    </div>
                  </div>
                  <div className="buyer-tools-card__meta">
                    <span>Price: Rs {Number(item.marketPrice || 0).toFixed(2)} / {item.unit || 'unit'}</span>
                    <span>Available: {item.availableQuantity} {item.unit}</span>
                  </div>
                  <div className="buyer-tools-card__footer">
                    <div className="buyer-tools-card__qty">
                      <label htmlFor={`qty-${item.cartId}`}>Quantity</label>
                      <input
                        id={`qty-${item.cartId}`}
                        type="number"
                        min="1"
                        step="0.1"
                        value={quantities[item.cartId] ?? ''}
                        onChange={(event) => setQuantities((prev) => ({ ...prev, [item.cartId]: event.target.value }))}
                        onClick={(event) => event.stopPropagation()}
                        onBlur={() => handleQuantitySave(item.cartId, true)}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleQuantitySave(item.cartId);
                          }
                        }}
                      />
                    </div>
                    <div className="buyer-tools-card__actions">
                      <Button variant="outline" onClick={(event) => { event.stopPropagation(); navigate(`/view-details/${item.cropId}`); }}>View Crop</Button>
                      <Button variant="accent" onClick={(event) => { event.stopPropagation(); setApproachItem(item); }}>Send Approach</Button>
                      <Button variant="ghost" onClick={(event) => { event.stopPropagation(); handleRemove(item.cartId); }} loading={actionLoading === `remove-${item.cartId}`}>Remove</Button>
                    </div>
                  </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        {!loading && !error && totalPages > 1 ? (
          <div className="view-all-pagination">
            <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>Previous</Button>
            <span className="view-all-pagination__info">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page >= totalPages - 1}>Next</Button>
          </div>
        ) : null}
      </div>
      {approachItem ? (
        <ApproachFarmer
          cropId={approachItem.cropId}
          initialQuantity={Number(quantities[approachItem.cartId] || approachItem.requestedQuantity || 1)}
          onClose={() => setApproachItem(null)}
          onSuccess={handleApproachFromCart}
        />
      ) : null}
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
