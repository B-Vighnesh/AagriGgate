import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';
import Button from './common/Button';
import Card from './common/Card';

const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect fill="%23e7f4ee" width="360" height="220"/><rect fill="%23cfe7da" x="0" y="160" width="360" height="60"/><text x="180" y="118" font-family="Arial" font-size="24" text-anchor="middle" fill="%232a6e55">Crop Image</text></svg>';

function CropCard({ crop, imageUrl, onViewDetails }) {
  const handleOpen = () => onViewDetails(crop.cropID);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <Card
      className="view-all-card view-all-card--clickable"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${crop.cropName}`}
    >
      <div className="view-all-card__image-wrap">
        <img
          src={imageUrl || IMAGE_PLACEHOLDER}
          alt={crop.cropName}
          className="view-all-card__image"
          onError={(event) => { event.currentTarget.src = IMAGE_PLACEHOLDER; }}
        />
        <span className="view-all-card__badge">{crop.cropType}</span>
      </div>

      <div className="view-all-card__body">
        <h3>{crop.cropName}</h3>
        <p className="view-all-card__meta">
          Farmer: {crop.farmerName || 'N/A'} | Region: {crop.region || 'N/A'}
        </p>

        <div className="view-all-card__price-row">
          <div>
            <p className="view-all-card__price">Rs {Number(crop.marketPrice || 0).toFixed(2)}</p>
            <p className="view-all-card__unit">per {crop.unit || 'unit'}</p>
          </div>
          <p className="view-all-card__qty">Qty: {crop.quantity} {crop.unit}</p>
        </div>
      </div>
    </Card>
  );
}

export default function ViewAllCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();
  const PAGE_SIZE = 10;

  const [crops, setCrops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ region: '', price: '', category: '', farmerName: '' });
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ region: '', price: '', category: '', farmerName: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedSearch(searchQuery);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(PAGE_SIZE),
        });

        if (appliedSearch.trim()) params.set('keyword', appliedSearch.trim());
        if (appliedFilters.region.trim()) params.set('region', appliedFilters.region.trim());
        if (appliedFilters.category.trim()) params.set('category', appliedFilters.category.trim());
        if (appliedFilters.farmerName.trim()) params.set('farmerName', appliedFilters.farmerName.trim());
        if (appliedFilters.price) params.set('maxPrice', appliedFilters.price);

        const response = await apiGet(`/crops/legacy?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to load crops. Please try again.');

        const data = await response.json();
        const cropList = Array.isArray(data?.content) ? data.content : [];
        if (!mounted) return;
        setCrops(cropList);
        setTotalPages(Number(data?.totalPages || 0));
        setTotalElements(Number(data?.totalElements || cropList.length || 0));

        cropList.forEach(async (crop) => {
          try {
            const imageResponse = await apiFetch(`/crops/legacy/${crop.cropID}/image`);
            if (!imageResponse.ok) return;
            const blob = await imageResponse.blob();
            if (!mounted) return;
            setImageUrls((prev) => ({ ...prev, [crop.cropID]: URL.createObjectURL(blob) }));
          } catch {
            // keep placeholder image on failures
          }
        });
      } catch (loadError) {
        if (mounted) setError(loadError.message || 'Failed to load crops.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
      Object.values(imageUrls).forEach((url) => {
        try { URL.revokeObjectURL(url); } catch { /* ignore */ }
      });
    };
  }, [page, token, navigate, appliedSearch, appliedFilters]);

  const applyFilters = () => {
    setPage(0);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { region: '', price: '', category: '', farmerName: '' };
    setSearchQuery('');
    setFilters(emptyFilters);
    setAppliedSearch('');
    setAppliedFilters(emptyFilters);
    setPage(0);
  };

  return (
    <section className="page view-all-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="ag-container">
        <div className="view-all-head">
          <div>
            <h1 className="section-title">Available Crops</h1>
            <p className="section-subtitle">Browse fresh produce directly from farmers.</p>
          </div>

          {role === 'buyer' && (
            <Link to="/view-approaches-user">
              <Button variant="outline" className="view-all-requests-btn">My Requests</Button>
            </Link>
          )}
        </div>

        <Card className="view-all-search-card">
          <div className="view-all-toolbar__head">
            <div>
              <h3>Search Crops</h3>
              <p>Start typing to search crops by name, type, region, or farmer.</p>
            </div>
          </div>
          <div className="view-all-search-row">
            <input
              className="view-all-input"
              type="text"
              placeholder="Search by crop, type, region or farmer..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </Card>

        <Card className="view-all-filter-card">
          <div className="view-all-toolbar__head">
            <div>
              <h3>Filters</h3>
              <p>Narrow results by region, category, price, or farmer.</p>
            </div>
          </div>
          <div className="view-all-filter-grid">
            <input
              className="view-all-input"
              placeholder="Region"
              value={filters.region}
              onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
            />
            <input
              className="view-all-input"
              type="number"
              min="0"
              placeholder="Max price (Rs)"
              value={filters.price}
              onChange={(event) => setFilters((prev) => ({ ...prev, price: event.target.value }))}
            />
            <input
              className="view-all-input"
              placeholder="Category"
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            />
            <input
              className="view-all-input"
              placeholder="Farmer name"
              value={filters.farmerName}
              onChange={(event) => setFilters((prev) => ({ ...prev, farmerName: event.target.value }))}
            />
          </div>

          <div className="view-all-filter-actions">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </Card>

        {loading && (
          <div className="view-all-loading">
            <span className="ui-spinner ui-spinner--lg" />
            <span>Loading crops...</span>
          </div>
        )}

        {!loading && error && (
          <Card className="view-all-empty">
            <p className="view-all-empty__icon">!</p>
            <p className="view-all-empty__title">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {!loading && !error && (
          <p className="view-all-count">
            Showing {crops.length} crop{crops.length !== 1 ? 's' : ''} on this page
            {totalElements ? ` | ${totalElements} total` : ''}
          </p>
        )}

        {!loading && !error && crops.length > 0 && (
          <div className="view-all-grid">
            {crops.map((crop) => (
              <CropCard
                key={crop.cropID}
                crop={crop}
                imageUrl={imageUrls[crop.cropID]}
                onViewDetails={(id) => navigate(`/view-details/${id}`)}
              />
            ))}
          </div>
        )}

        {!loading && !error && crops.length === 0 && (
          <Card className="view-all-empty">
            <p className="view-all-empty__icon">0</p>
            <p className="view-all-empty__title">No crops match your filters.</p>
            <p className="view-all-empty__desc">Try different filters or clear the current selection.</p>
          </Card>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="view-all-pagination">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="view-all-pagination__info">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}


