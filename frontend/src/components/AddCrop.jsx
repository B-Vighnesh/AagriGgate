import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];

export default function AddCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [cropData, setCropData] = useState({
    cropName: '', cropType: '', region: '', marketPrice: '', quantity: '', unit: 'kg', description: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [locating, setLocating] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!token || !farmerId) { navigate('/login'); return; }
    if (role === 'buyer') { navigate('/404'); return; }
    autoFillRegion();
  }, []);

  const autoFillRegion = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=4138beff07ea4a259f0c2ff71ba19378`);
        const data = await res.json();
        if (data.results?.length) {
          const c = data.results[0].components;
          const parts = [c.village || c.hamlet || c.locality, c.district || c.county, c.state].filter(Boolean);
          setCropData(prev => ({ ...prev, region: parts.join(', ') }));
        }
      } catch { /* silently skip geo-fill */ }
      setLocating(false);
    }, () => setLocating(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCropData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const cropObj = {
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
      const res = await fetch('http://localhost:8080/crops/farmer/addCrop', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        showToast('Crop added successfully! Redirecting…', 'success');
        setTimeout(() => navigate('/view-crop'), 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to add crop.', 'error');
      }
    } catch {
      showToast('Server busy. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper max-w-2xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>← Back</button>
        <div>
          <h1 className="section-title text-3xl">Add New Crop</h1>
          <p className="section-subtitle">List your produce for buyers to discover.</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Crop Name *</label>
              <input className="form-input" name="cropName" required value={cropData.cropName} onChange={handleChange} placeholder="e.g. Tomato" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="cropType" required value={cropData.cropType} onChange={handleChange}>
                <option value="">Select Category</option>
                {CROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              Region
              {locating && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📍 Detecting…</span>}
            </label>
            <input className="form-input" name="region" value={cropData.region} onChange={handleChange} placeholder="Auto-filled from GPS or type manually" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Market Price (₹) *</label>
              <input className="form-input" type="number" min="0" step="0.01" name="marketPrice" required value={cropData.marketPrice} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="0" name="quantity" required value={cropData.quantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-select" name="unit" required value={cropData.unit} onChange={handleChange}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input min-h-[80px] resize-none" name="description" required value={cropData.description} onChange={handleChange} placeholder="Quality, freshness, harvesting method…" />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Crop Photo *</label>
            <div className="flex gap-4 items-start">
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl w-32 h-32 cursor-pointer transition-all duration-200"
                style={{ borderColor: 'var(--color-primary-light)', color: 'var(--color-text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-primary-light)'}
              >
                <span className="text-3xl">📷</span>
                <span className="text-xs mt-1">Upload / Camera</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} required={!image} />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                    style={{ background: '#ef4444', color: '#fff' }}
                    onClick={() => { setImage(null); setImagePreview(null); }}
                  >×</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
              {loading ? <><span className="spinner" /> Adding…</> : '+ Add Crop'}
            </button>
            <Link to="/view-crop" className="btn-outline flex-1 py-3 text-center">View My Crops</Link>
          </div>
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