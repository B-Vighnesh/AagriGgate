import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import { getApiBaseUrl } from '../lib/api';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];

export default function AddCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [cropData, setCropData] = useState({
    cropName: '',
    cropType: '',
    region: '',
    marketPrice: '',
    quantity: '',
    unit: 'kg',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  useEffect(() => {
    if (!token || !farmerId) {
      navigate('/login');
      return;
    }
    if (role === 'buyer') {
      navigate('/404');
      return;
    }
    autoFillRegion();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const autoFillRegion = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=4138beff07ea4a259f0c2ff71ba19378`);
          const data = await response.json();
          const components = data?.results?.[0]?.components;
          if (components) {
            const locationText = [
              components.village || components.hamlet || components.locality,
              components.district || components.county,
              components.state,
            ].filter(Boolean).join(', ');
            setCropData((prev) => ({ ...prev, region: locationText }));
          }
        } catch {
          // keep silent for geo failures
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  };

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setCropData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const payload = {
      cropName: cropData.cropName.trim(),
      cropType: cropData.cropType,
      region: cropData.region.trim(),
      marketPrice: Number(cropData.marketPrice),
      quantity: Number(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description.trim(),
      farmer: { farmerId: Number(farmerId) },
    };

    formData.append('crop', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) formData.append('imageFile', image);

    try {
      const response = await fetch(`${getApiBaseUrl()}/crops/farmer/addCrop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to add crop.');
      }

      showToast('Crop added successfully.', 'success');
      setTimeout(() => navigate('/view-crop'), 800);
    } catch (err) {
      showToast(err.message || 'Server busy. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page add-crop-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="add-crop-head">
          {/* <button type="button" className="link-back" onClick={() => navigate(-1)}>Back</button> */}
          <div>
            <h1>Add New Crop</h1>
            <p>List your produce for buyers to discover.</p>
          </div>
        </div>

        <Card className="add-crop-card">
          <form className="add-crop-form" onSubmit={submit}>
            <div className="add-crop-grid add-crop-grid--2">
              <div className="add-crop-field">
                <label htmlFor="cropName">Crop Name *</label>
                <input id="cropName" name="cropName" value={cropData.cropName} onChange={onFieldChange} placeholder="e.g. Tomato" required />
              </div>
              <div className="add-crop-field">
                <label htmlFor="cropType">Category *</label>
                <select id="cropType" name="cropType" value={cropData.cropType} onChange={onFieldChange} required>
                  <option value="">Select Category</option>
                  {CROP_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="add-crop-field">
              <label htmlFor="region">
                Region
                {locating ? <span className="muted-inline">Detecting location...</span> : null}
              </label>
              <input
                id="region"
                name="region"
                value={cropData.region}
                onChange={onFieldChange}
                placeholder="Auto-filled from GPS or type manually"
              />
            </div>

            <div className="add-crop-grid add-crop-grid--3">
              <div className="add-crop-field">
                <label htmlFor="marketPrice">Market Price (Rs) *</label>
                <input id="marketPrice" type="number" min="0" step="0.01" name="marketPrice" value={cropData.marketPrice} onChange={onFieldChange} placeholder="0.00" required />
              </div>
              <div className="add-crop-field">
                <label htmlFor="quantity">Quantity *</label>
                <input id="quantity" type="number" min="0" name="quantity" value={cropData.quantity} onChange={onFieldChange} placeholder="0" required />
              </div>
              <div className="add-crop-field">
                <label htmlFor="unit">Unit *</label>
                <select id="unit" name="unit" value={cropData.unit} onChange={onFieldChange} required>
                  {UNITS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="add-crop-field">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={cropData.description}
                onChange={onFieldChange}
                placeholder="Quality, freshness, harvesting method..."
                required
              />
            </div>

            <div className="add-crop-field">
              <label htmlFor="imageFile">Crop Photo *</label>
              <div className="add-crop-image-row">
                <input id="imageFile" type="file" accept="image/*" capture="environment" onChange={onImageChange} required={!image} />
                {imagePreview ? <img src={imagePreview} alt="Crop preview" className="add-crop-preview" /> : null}
              </div>
            </div>

            <div className="add-crop-actions">
              <Button type="submit" loading={loading} className="full-width">
                {loading ? 'Adding crop...' : 'Add Crop'}
              </Button>
              <Link to="/view-crop" className="ui-btn ui-btn--outline full-width text-center">View My Crops</Link>
            </div>
          </form>
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
