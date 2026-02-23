import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiFetch } from '../lib/api';
import ValidateToken from './ValidateToken';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];

export default function UpdateCrop() {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [cropData, setCropData] = useState({ cropName: '', cropType: '', region: '', marketPrice: '', quantity: '', unit: 'kg', description: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    if (role === 'buyer') { navigate('/404'); return; }

    Promise.all([
      apiFetch(`/crops/crop/${cropId}`),
      apiFetch(`/crops/viewUrl/${cropId}`),
    ])
      .then(async ([detailsRes, imgRes]) => {
        if (detailsRes.ok) setCropData(await detailsRes.json());
        else { showToast('Could not load crop data.', 'error'); navigate(-1); return; }
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          setExistingImage(URL.createObjectURL(blob));
        }
      })
      .catch(() => showToast('Server busy. Please try again.', 'error'))
      .finally(() => setFetchLoading(false));
  }, [cropId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCropData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const cropObj = {
      cropID: parseInt(cropId),
      cropName: cropData.cropName,
      cropType: cropData.cropType,
      region: cropData.region,
      marketPrice: parseFloat(cropData.marketPrice),
      quantity: parseFloat(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description,
      farmer: { farmerId: parseInt(farmerId) },
    };

    formData.append('crop', new Blob([JSON.stringify(cropObj)], { type: 'application/json' }));
    if (image) formData.append('imageFile', image);

    try {
      const res = await fetch(`http://localhost:8080/crops/farmer/update/${cropId}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) {
        showToast('Crop updated successfully! Redirecting…', 'success');
        setTimeout(() => navigate(`/view-details/${cropId}`), 1500);
      } else {
        showToast('Failed to update crop. Try again.', 'error');
      }
    } catch {
      showToast('Server busy. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="page-wrapper max-w-2xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>← Back</button>
        <div>
          <h1 className="section-title text-3xl">Update Crop</h1>
          <p className="section-subtitle">Make changes and save.</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Crop Name *</label>
              <input className="form-input" name="cropName" required value={cropData.cropName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="cropType" required value={cropData.cropType} onChange={handleChange}>
                <option value="">Select</option>
                {CROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Region</label>
            <input className="form-input" name="region" value={cropData.region} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Market Price (₹) *</label>
              <input className="form-input" type="number" min="0" step="0.01" name="marketPrice" required value={cropData.marketPrice} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="0" name="quantity" required value={cropData.quantity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-select" name="unit" required value={cropData.unit} onChange={handleChange}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input min-h-[80px] resize-none" name="description" value={cropData.description} onChange={handleChange} />
          </div>

          {/* Image section */}
          <div className="form-group">
            <label className="form-label">Crop Photo</label>
            <div className="flex gap-4 items-start flex-wrap">
              {existingImage && !imagePreview && (
                <div className="relative">
                  <img src={existingImage} alt="Current" className="w-32 h-32 object-cover rounded-xl shadow" />
                  <span className="absolute -bottom-1 left-0 right-0 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Current</span>
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl w-32 h-32 cursor-pointer transition-all duration-200"
                style={{ borderColor: 'var(--color-primary-light)', color: 'var(--color-text-muted)' }}
              >
                <span className="text-3xl">📷</span>
                <span className="text-xs mt-1">Replace Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="New" className="w-32 h-32 object-cover rounded-xl shadow" />
                  <button type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                    style={{ background: '#ef4444', color: '#fff' }}
                    onClick={() => { setImage(null); setImagePreview(null); }}
                  >×</button>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
