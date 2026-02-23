import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];

export default function UpdateCrop() {
  const navigate = useNavigate();
  const { cropId } = useParams();
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
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 3000);
  };

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }

    if (role === 'buyer') {
      navigate('/404');
      return;
    }

    let mounted = true;
    let existingObjectUrl = '';

    const loadCrop = async () => {
      setFetchLoading(true);
      try {
        const detailsRes = await apiFetch(`/crops/legacy/${cropId}`);

        if (!detailsRes.ok) throw new Error('Could not load crop data.');

        const details = await detailsRes.json();
        if (mounted) {
          setCropData({
            cropName: details.cropName || '',
            cropType: details.cropType || '',
            region: details.region || '',
            marketPrice: details.marketPrice ?? '',
            quantity: details.quantity ?? '',
            unit: details.unit || 'kg',
            description: details.description || '',
          });
        }

        setExistingImage('');
      } catch (error) {
        showToast(error.message || 'Server busy. Please try again.', 'error');
        navigate(-1);
      } finally {
        if (mounted) setFetchLoading(false);
      }
    };

    loadCrop();

    return () => {
      mounted = false;
      if (existingObjectUrl) URL.revokeObjectURL(existingObjectUrl);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [cropId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCropData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }

    const preview = URL.createObjectURL(file);
    setImage(file);
    setImagePreview(preview);
  };

  const clearNewImage = () => {
    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      cropID: Number(cropId),
      cropName: cropData.cropName,
      cropType: cropData.cropType,
      region: cropData.region,
      marketPrice: Number(cropData.marketPrice),
      quantity: Number(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description,
      farmer: { farmerId: Number(farmerId) },
    };

    const formData = new FormData();
    formData.append('crop', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) formData.append('imageFile', image);

    try {
      const response = await fetch(`${getApiBaseUrl()}/crops/farmer/${cropId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update crop.');

      showToast('Crop updated successfully.', 'success');
      setTimeout(() => navigate(`/view-details/${cropId}`), 700);
    } catch (error) {
      showToast(error.message || 'Server busy. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page update-crop-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="ag-container">
        <div className="update-crop-head">
          <button className="link-back" onClick={() => navigate(-1)}>Back</button>
          <div>
            <h1>Update Crop</h1>
            <p>Make changes and save your listing.</p>
          </div>
        </div>

        <Card className="update-crop-card">
          <form className="update-crop-form" onSubmit={handleSubmit}>
            <div className="update-crop-grid update-crop-grid--2">
              <div className="update-crop-field">
                <label htmlFor="cropName">Crop Name *</label>
                <input id="cropName" name="cropName" required value={cropData.cropName} onChange={handleChange} />
              </div>
              <div className="update-crop-field">
                <label htmlFor="cropType">Category *</label>
                <select id="cropType" name="cropType" required value={cropData.cropType} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CROP_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="update-crop-field">
              <label htmlFor="region">Region</label>
              <input id="region" name="region" value={cropData.region} onChange={handleChange} />
            </div>

            <div className="update-crop-grid update-crop-grid--3">
              <div className="update-crop-field">
                <label htmlFor="marketPrice">Market Price (Rs) *</label>
                <input id="marketPrice" type="number" min="0" step="0.01" name="marketPrice" required value={cropData.marketPrice} onChange={handleChange} />
              </div>
              <div className="update-crop-field">
                <label htmlFor="quantity">Quantity *</label>
                <input id="quantity" type="number" min="0" step="0.01" name="quantity" required value={cropData.quantity} onChange={handleChange} />
              </div>
              <div className="update-crop-field">
                <label htmlFor="unit">Unit *</label>
                <select id="unit" name="unit" required value={cropData.unit} onChange={handleChange}>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="update-crop-field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="4" value={cropData.description} onChange={handleChange} />
            </div>

            <div className="update-crop-image-row">
              {existingImage && !imagePreview ? (
                <div className="update-crop-preview-wrap">
                  <img src={existingImage} alt="Current crop" className="update-crop-preview" />
                  <small>Current image</small>
                </div>
              ) : null}

              <label className="update-crop-upload" htmlFor="cropImage">
                <input id="cropImage" type="file" accept="image/*" onChange={handleImageChange} />
                <span>Choose new photo</span>
              </label>

              {imagePreview ? (
                <div className="update-crop-preview-wrap">
                  <img src={imagePreview} alt="New crop" className="update-crop-preview" />
                  <button type="button" className="update-crop-remove" onClick={clearNewImage}>Remove</button>
                </div>
              ) : null}
            </div>

            <Button type="submit" loading={loading} className="full-width">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
