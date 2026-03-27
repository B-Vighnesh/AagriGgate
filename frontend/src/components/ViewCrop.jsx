import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { apiGet, apiFetch } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23d8f3dc"/><text x="50%" y="54%" text-anchor="middle" font-size="26" fill="%231f6f54">No Image</text></svg>';

export default function ViewCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();
  const PAGE_SIZE = 10;

  const [crops, setCrops] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!token || !farmerId) {
      navigate('/login');
      return;
    }
    if (role === 'buyer') {
      navigate('/404');
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiGet(`/crops/farmer/me/legacy?page=${page}&size=${PAGE_SIZE}`);
        if (!response.ok) throw new Error('Unable to load crops.');
        const data = await response.json();
        if (!mounted) return;
        const cropList = Array.isArray(data?.content) ? data.content : [];
        setCrops(cropList);
        setTotalPages(Number(data?.totalPages || 0));
        setTotalElements(Number(data?.totalElements || cropList.length || 0));

        cropList.forEach(async (crop) => {
          try {
            const imgRes = await apiFetch(`/crops/legacy/${crop.cropID}/image`, { method: 'GET' });
            if (!imgRes.ok) return;
            const blob = await imgRes.blob();
            if (!mounted) return;
            setImages((prev) => ({ ...prev, [crop.cropID]: URL.createObjectURL(blob) }));
          } catch {
            // keep placeholder image on failures
          }
        });
      } catch (err) {
        if (mounted) setError(err.message || 'Server busy. Try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      Object.values(images).forEach((url) => {
        try { URL.revokeObjectURL(url); } catch { /* ignore */ }
      });
    };
  }, [page, token, farmerId, role, navigate]);

  const filteredCrops = useMemo(() => {
    if (!query.trim()) return crops;
    const q = query.toLowerCase();
    return crops.filter((crop) =>
      (crop.cropName || '').toLowerCase().includes(q) ||
      (crop.cropType || '').toLowerCase().includes(q) ||
      (crop.region || '').toLowerCase().includes(q)
    );
  }, [crops, query]);

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page page--center">
        <Card className="narrow-card text-center">
          <h2>Unable to load crops</h2>
          <p className="error-text">{error}</p>
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => navigate('/login')}>Go to Login</button>
        </Card>
      </section>
    );
  }

  return (
    <section className="page view-crop-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="view-crop-head">
          <div>
            <h1>My Crops Dashboard</h1>
            <p>
              Showing {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} on this page
              {totalElements ? ` • ${totalElements} total` : ''}
            </p>
          </div>
          <Link to="/add-crop" className="ui-btn ui-btn--primary">Add New Crop</Link>
        </div>

        <div className="view-crop-search">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by crop name, type, or region"
          />
        </div>

        {filteredCrops.length === 0 ? (
          <Card className="view-crop-empty">
            {crops.length === 0 ? 'No crops listed yet. Add your first crop.' : 'No crops match your search.'}
          </Card>
        ) : (
          <div className="view-crop-grid">
            {filteredCrops.map((crop) => (
              <Card key={crop.cropID} className="view-crop-card" onClick={() => navigate(`/view-details/${crop.cropID}`)}>
                <div className="view-crop-card__image-wrap">
                  <img
                    src={images[crop.cropID] || PLACEHOLDER}
                    alt={crop.cropName}
                    onError={(event) => { event.currentTarget.src = PLACEHOLDER; }}
                  />
                </div>
                <div className="view-crop-card__body">
                  <div className="view-crop-card__top">
                    <h3>{crop.cropName}</h3>
                    <span>{crop.cropType}</span>
                  </div>
                  <p className="region">{crop.region}</p>
                  <div className="view-crop-card__price">
                    <strong>Rs {Number(crop.marketPrice || 0).toFixed(2)}</strong>
                    <small>per {crop.unit}</small>
                  </div>
                  <p className="qty">{crop.quantity} {crop.unit}</p>
                </div>
              </Card>
            ))}
          </div>
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
