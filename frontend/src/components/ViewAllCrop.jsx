import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';
import Button from './common/Button';
import Card from './common/Card';

const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect fill="%23e7f4ee" width="360" height="220"/><rect fill="%23cfe7da" x="0" y="160" width="360" height="60"/><text x="180" y="118" font-family="Arial" font-size="24" text-anchor="middle" fill="%232a6e55">Crop Image</text></svg>';

function CropCard({ crop, imageUrl, onViewDetails }) {
  return (
    <Card className="view-all-card">
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
          Farmer: {crop.farmer?.firstName || 'N/A'} | Region: {crop.region || 'N/A'}
        </p>

        <div className="view-all-card__price-row">
          <div>
            <p className="view-all-card__price">Rs {Number(crop.marketPrice || 0).toFixed(2)}</p>
            <p className="view-all-card__unit">per {crop.unit || 'unit'}</p>
          </div>
          <p className="view-all-card__qty">Qty: {crop.quantity} {crop.unit}</p>
        </div>

        <Button className="view-all-card__cta" onClick={() => onViewDetails(crop.cropID)}>
          View Details
        </Button>
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
        const response = await apiGet(`/crops/legacy?page=${page}&size=${PAGE_SIZE}`);
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
  }, [page, token, navigate]);

  const filteredCrops = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return crops.filter((crop) => {
      const cropName = (crop.cropName || '').toLowerCase();
      const cropType = (crop.cropType || '').toLowerCase();
      const region = (crop.region || '').toLowerCase();
      const farmer = (crop.farmer?.firstName || '').toLowerCase();

      const matchQuery = !query || cropName.includes(query) || cropType.includes(query) || region.includes(query) || farmer.includes(query);
      const matchRegion = !filters.region || region.includes(filters.region.toLowerCase());
      const matchCategory = !filters.category || cropType.includes(filters.category.toLowerCase());
      const matchFarmer = !filters.farmerName || farmer.includes(filters.farmerName.toLowerCase());
      const matchPrice = !filters.price || Number(crop.marketPrice || 0) <= Number(filters.price);

      return matchQuery && matchRegion && matchCategory && matchFarmer && matchPrice;
    });
  }, [crops, searchQuery, filters]);

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

        <Card className="view-all-filter-card">
          <div className="view-all-search-row">
            <input
              className="view-all-input"
              type="text"
              placeholder="Search by crop, type, region or farmer..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="view-all-filter-grid">
            <input
              className="view-all-input"
              placeholder="Filter by region"
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
              placeholder="Filter by category"
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            />
            <input
              className="view-all-input"
              placeholder="Filter by farmer"
              value={filters.farmerName}
              onChange={(event) => setFilters((prev) => ({ ...prev, farmerName: event.target.value }))}
            />
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
            Showing {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} on this page
            {totalElements ? ` • ${totalElements} total` : ''}
          </p>
        )}

        {!loading && !error && filteredCrops.length > 0 && (
          <div className="view-all-grid">
            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.cropID}
                crop={crop}
                imageUrl={imageUrls[crop.cropID]}
                onViewDetails={(id) => navigate(`/view-details/${id}`)}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredCrops.length === 0 && (
          <Card className="view-all-empty">
            <p className="view-all-empty__icon">0</p>
            <p className="view-all-empty__title">No crops match your search.</p>
            <p className="view-all-empty__desc">Try adjusting filters or clear your search.</p>
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
