import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiGet } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import { getCropImageBlob, normalizeCropPage } from '../api/cropApi';

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
  const [appliedQuery, setAppliedQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [listingFilter, setListingFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const loadMoreRef = useRef(null);
  const imageUrlRegistryRef = useRef(new Set());

  const revokeAllImageUrls = useCallback(() => {
    imageUrlRegistryRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    });
    imageUrlRegistryRef.current.clear();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2200);
  };

  const getCardTone = (crop) => {
    if (crop.isUrgent) return 'urgent';
    if (crop.isWaste) return 'waste';
    return 'normal';
  };
  const handleCropImageLoad = (event) => {
    const img = event.currentTarget;
    img.closest('.view-crop-card__image-wrap')?.classList.toggle('landscape', img.naturalWidth > img.naturalHeight);
  };
  const handleCropImageError = (event) => {
    const img = event.currentTarget;
    img.closest('.view-crop-card__image-wrap')?.classList.add('image-wrap--empty');
    img.remove();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedQuery(query);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [sortBy, listingFilter]);

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
      const append = page > 0;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError('');
        setCrops([]);
        setImages({});
        revokeAllImageUrls();
        setTotalPages(0);
        setTotalElements(0);
        setHasMore(false);
      }
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(PAGE_SIZE),
        });
        if (appliedQuery.trim()) {
          params.set('keyword', appliedQuery.trim());
        }
        if (sortBy) {
          params.set('sortBy', sortBy);
        }
        if (listingFilter === 'urgent') {
          params.set('urgentOnly', 'true');
        }
        if (listingFilter === 'waste') {
          params.set('wasteOnly', 'true');
        }
        if (listingFilter === 'normal') {
          params.set('normalOnly', 'true');
        }
        if (listingFilter === 'discount') {
          params.set('discountOnly', 'true');
        }

        const response = await apiGet(`/crops/farmer/me/legacy?${params.toString()}`);
        if (!response.ok) throw new Error('Unable to load crops.');
        const data = normalizeCropPage(await response.json());
        if (!mounted) return;
        const cropList = Array.isArray(data?.content) ? data.content : [];
        const nextPage = Number(data?.number ?? page);
        const nextTotalPages = Number(data?.totalPages || 0);
        setCrops((prev) => (append ? [...prev, ...cropList] : cropList));
        setTotalPages(nextTotalPages);
        setTotalElements(Number(data?.totalElements || cropList.length || 0));
        setHasMore(Boolean(data?.last === false || nextPage + 1 < nextTotalPages));

        cropList.forEach(async (crop) => {
          try {
            const blob = await getCropImageBlob(crop.cropID, 'thumbnail');
            if (!blob) return;
            if (!mounted) return;
            const objectUrl = URL.createObjectURL(blob);
            imageUrlRegistryRef.current.add(objectUrl);
            setImages((prev) => {
              if (prev[crop.cropID]) {
                try { URL.revokeObjectURL(prev[crop.cropID]); } catch { /* ignore */ }
                imageUrlRegistryRef.current.delete(prev[crop.cropID]);
              }
              return { ...prev, [crop.cropID]: objectUrl };
            });
          } catch {
            // keep placeholder image on failures
          }
        });
      } catch (err) {
        if (mounted) setError(err.message || 'Server busy. Try again.');
      } finally {
        if (mounted) {
          if (append) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, token, farmerId, role, navigate, appliedQuery, sortBy, listingFilter, revokeAllImageUrls]);

  useEffect(() => () => {
    revokeAllImageUrls();
  }, [revokeAllImageUrls]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading || loadingMore) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) {
        return;
      }
      setPage((prev) => prev + 1);
    }, {
      rootMargin: '200px 0px',
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

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

  const handleShare = async (crop) => {
    const shareUrl = `${window.location.origin}/view-details/${crop.cropID}`;
    const shareData = {
      title: crop.cropName,
      text: `Check out my crop listing for ${crop.cropName}.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Crop link shared.', 'success');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showToast('Crop link copied.', 'success');
    } catch {
      showToast('Unable to share crop right now.', 'error');
    }
  };

  return (
    <section className="page view-crop-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="view-crop-head">
          <div>
            <h1>My Crops Dashboard</h1>
            <p>
              Showing {crops.length} crop{crops.length !== 1 ? 's' : ''}
              {totalElements ? ` | ${totalElements} total` : ''}
            </p>
          </div>
          <Link to="/add-crop" className="ui-btn ui-btn--primary view-crop-head__add-btn">Add New Crop</Link>
        </div>

        <Card className="view-all-search-card">
          <div className="view-all-toolbar__head">
            <div>
              <h3>Search My Crops</h3>
              <p>Start typing to find your listings by crop name, then refine by order or listing type.</p>
            </div>
          </div>
          <div className="view-all-search-row view-all-search-row--split">
            <input
              type="text"
              className="view-all-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by crop name"
            />
            <select
              className="view-all-input"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <select
              className="view-all-input"
              value={listingFilter}
              onChange={(event) => setListingFilter(event.target.value)}
            >
              <option value="all">All listings</option>
              <option value="normal">Normal crops only</option>
              <option value="urgent">Urgent sales only</option>
              <option value="waste">Waste items only</option>
              <option value="discount">Discount items only</option>
            </select>
          </div>
        </Card>

        {crops.length === 0 ? (
          <Card className="view-crop-empty">
            {appliedQuery ? 'No crops match your search.' : 'No crops listed yet. Add your first crop.'}
          </Card>
        ) : (
          <div className="view-crop-grid">
            {crops.map((crop) => (
              <Card key={crop.cropID} className={`view-crop-card view-crop-card--${getCardTone(crop)}`} onClick={() => navigate(`/view-details/${crop.cropID}`)}>
                <div className="view-crop-card__image-wrap">
                  {images[crop.cropID] ? (
                    <img
                      src={images[crop.cropID]}
                      alt={crop.cropName}
                      onLoad={handleCropImageLoad}
                      onError={handleCropImageError}
                    />
                  ) : <span className="crop-image-empty">No image</span>}
                  <span className="view-all-card__badge">{crop.cropType}</span>
                </div>
                <div className="view-crop-card__body">
                  <div className="view-crop-card__top">
                    <h3>{crop.cropName}</h3>

                    {crop.status ? <span className={`crop-flag crop-flag--${crop.status.toLowerCase()}`}>{crop.status}</span> : null}
                    {crop.isUrgent ? <span className="crop-flag crop-flag--urgent">Urgent</span> : null}
                    {crop.isWaste ? <span className="crop-flag crop-flag--waste">Waste</span> : null}
                  </div>
                  <p className="region">
                    {[crop.region, crop.district, crop.state].filter(Boolean).join(' | ')}
                  </p>
                  <div className="view-crop-card__price">
                    <strong>Rs {Number(crop.marketPrice || 0).toFixed(2)}</strong>
                    <small>per {crop.unit}</small>
                  </div>
                  {crop.discountPrice ? <p className="view-all-card__discount">Discount: Rs {Number(crop.discountPrice).toFixed(2)}</p> : null}
                  <p className="qty">{crop.quantity} {crop.unit}</p>
                  <div className="view-crop-card__actions">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Edit crop"
                      data-tooltip="Edit crop"
                      title="Edit crop"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/update-crop/${crop.cropID}`);
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square view-crop-card__action-icon" aria-hidden="true" />
                      <span className="view-crop-card__action-text">Update</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="View requests for this crop"
                      data-tooltip="View requests for this crop"
                      title="View requests for this crop"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/view-approaches/farmer/${farmerId}/crop/${crop.cropID}`);
                      }}
                    >
                      <i className="fa-solid fa-inbox view-crop-card__action-icon" aria-hidden="true" />
                      <span className="view-crop-card__action-text">Requests</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Share crop"
                      data-tooltip="Share crop"
                      title="Share crop"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleShare(crop);
                      }}
                    >
                      <i className="fa-solid fa-share-nodes view-crop-card__action-icon" aria-hidden="true" />
                      <span className="view-crop-card__action-text">Share</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && crops.length > 0 && (
          <>
            {hasMore ? <div ref={loadMoreRef} style={{ height: '1px' }} /> : null}
            {loadingMore ? (
              <div className="view-all-loading view-all-loading--more">
                <span className="ui-spinner" />
                <span>Loading more listings...</span>
              </div>
            ) : null}
            {!hasMore && totalPages > 1 ? (
              <p className="view-all-pagination__info">You have reached the end of your listings.</p>
            ) : null}
          </>
        )}
      </div>
      <Link to="/add-crop" className="view-crop-fab" aria-label="Add crop" data-tooltip="Add crop" title="Add crop">
        <i className="fa-solid fa-plus" aria-hidden="true" />
      </Link>
      {toast.message ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );
}
