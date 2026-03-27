import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { addToCart, getFavorites, removeFavorite } from '../api/buyerToolsApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const PAGE_SIZE = 10;

function FavoriteCard({ item, onAddToCart, onRemove, onViewDetails, loadingAction }) {
  const tone = item.isUrgent ? 'urgent' : item.isWaste ? 'waste' : 'normal';
  const handleOpen = () => onViewDetails(item.cropId);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <Card
      className={`view-all-card view-all-card--clickable view-all-card--${tone}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.cropName}`}
    >
      <div className="view-all-card__body">
        <h3>{item.cropName}</h3>
        <p className="view-all-card__meta">
          Farmer: {item.farmerName || 'N/A'} | Region: {item.region || 'N/A'}
        </p>
        <div className="crop-flag-row">
          {item.status ? <span className={`crop-flag crop-flag--${item.status.toLowerCase()}`}>{item.status}</span> : null}
          {item.isUrgent ? <span className="crop-flag crop-flag--urgent">Urgent</span> : null}
          {item.isWaste ? <span className="crop-flag crop-flag--waste">Waste</span> : null}
          {item.discountPrice ? <span className="crop-flag crop-flag--discount">Discount</span> : null}
        </div>
        <div className="view-all-card__price-row">
          <div>
            <p className="view-all-card__price">Rs {Number(item.marketPrice || 0).toFixed(2)}</p>
            <p className="view-all-card__unit">per {item.unit || 'unit'}</p>
            {item.discountPrice ? (
              <p className="view-all-card__discount">Discount: Rs {Number(item.discountPrice).toFixed(2)}</p>
            ) : null}
          </div>
          <p className="view-all-card__qty">Qty: {item.quantity} {item.unit}</p>
        </div>
        <div className="buyer-tools-card__actions">
          <Button variant="outline" onClick={(event) => { event.stopPropagation(); onAddToCart(item.cropId); }} loading={loadingAction === `cart-${item.cropId}`}>
            Add to Cart
          </Button>
          <Button variant="ghost" onClick={(event) => { event.stopPropagation(); onRemove(item.cropId); }} loading={loadingAction === `remove-${item.cropId}`}>
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Favorites() {
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
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, typeValue = 'info') => {
    setToast({ message, type: typeValue });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedSearch(search);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (role !== 'buyer') {
      navigate('/404');
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getFavorites({
          page,
          size: PAGE_SIZE,
          keyword: appliedSearch,
          type,
          sortBy,
        });
        if (!mounted) return;
        setItems(Array.isArray(data?.content) ? data.content : []);
        setTotalPages(Number(data?.totalPages || 0));
      } catch (loadError) {
        if (!mounted) return;
        setItems([]);
        setTotalPages(0);
        setError(loadError.message || 'Unable to load favorites.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, role, navigate, page, appliedSearch, type, sortBy]);

  const handleAddToCart = async (cropId) => {
    setActionLoading(`cart-${cropId}`);
    try {
      await addToCart({ cropId, quantity: 1 });
      showToast('Added to cart.', 'success');
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to add this crop to cart.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemove = async (cropId) => {
    setActionLoading(`remove-${cropId}`);
    try {
      await removeFavorite(cropId);
      setItems((prev) => prev.filter((item) => item.cropId !== cropId));
      showToast('Removed from favorites.', 'info');
    } catch (errorValue) {
      showToast(errorValue.message || 'Unable to remove favorite.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <section className="page buyer-tools-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />
      <div className="ag-container">
        <div className="buyer-tools-head">
          <div>
            <h1>Favorites</h1>
            <p>Keep crop listings you want to revisit later.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/cart')}>Open Cart</Button>
        </div>

        <Card className="buyer-tools-toolbar">
          <input
            className="view-all-input"
            placeholder="Search favorites by crop or farmer..."
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
            <span>Loading favorites...</span>
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="view-all-empty">
            <p className="view-all-empty__title">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card className="view-all-empty">
            <p className="view-all-empty__title">No favorites yet</p>
            <p className="view-all-empty__desc">Save crops from the listing or details page and they will appear here.</p>
            <Button onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
          </Card>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="view-all-grid">
            {items.map((item) => (
              <FavoriteCard
                key={item.favoriteId}
                item={item}
                onAddToCart={handleAddToCart}
                onRemove={handleRemove}
                onViewDetails={(id) => navigate(`/view-details/${id}`)}
                loadingAction={actionLoading}
              />
            ))}
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
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
