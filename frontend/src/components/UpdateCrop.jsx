import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { getCropImageBlob, normalizeCropResponse, updateCrop } from '../api/cropApi';
import statesAndDistricts from './statesAndDistricts';
import commodities from './commodities';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];
const CROP_STATUS = ['available', 'sold'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(',');

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
    state: '',
    district: '',
    marketPrice: '',
    quantity: '',
    unit: 'kg',
    description: '',
    isUrgent: false,
    isWaste: false,
    discountPrice: '',
    status: 'available',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [existingImage, setExistingImage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [commoditySelection, setCommoditySelection] = useState('');
  const districts = statesAndDistricts[cropData.state] || [];

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
    const loadCrop = async () => {
      setFetchLoading(true);
      try {
        const detailsRes = await apiFetch(`/crops/legacy/${cropId}`);

        if (!detailsRes.ok) throw new Error('Could not load crop data.');

        const details = normalizeCropResponse(await detailsRes.json());
        if (mounted) {
          const cropName = details.cropName || '';
          const matchingCommodity = commodities.find(
            (item) => item.toLowerCase() === cropName.trim().toLowerCase()
          );
          setCropData({
            cropName,
            cropType: details.cropType || '',
            region: details.region || '',
            state: details.state || '',
            district: details.district || '',
            marketPrice: details.marketPrice ?? '',
            quantity: details.quantity ?? '',
            unit: details.unit || 'kg',
            description: details.description || '',
            isUrgent: Boolean(details.isUrgent),
            isWaste: Boolean(details.isWaste),
            discountPrice: details.discountPrice ?? '',
            status: details.status || 'available',
          });
          setCommoditySelection(cropName ? (matchingCommodity || 'OTHER') : '');
        }

        const imageBlob = await getCropImageBlob(cropId, 'image');
        if (imageBlob && mounted) {
          setExistingImage(URL.createObjectURL(imageBlob));
        }

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
    };
  }, [cropId]);

  useEffect(() => () => {
    if (existingImage) URL.revokeObjectURL(existingImage);
  }, [existingImage]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCropData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleStateChange = (event) => {
    const value = event.target.value;
    setCropData((prev) => ({
      ...prev,
      state: value,
      district: '',
    }));
  };

  const handleCommodityChange = (event) => {
    const value = event.target.value;
    setCommoditySelection(value);
    setCropData((prev) => ({
      ...prev,
      cropName: value === 'OTHER' ? '' : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      showToast('Please select a JPEG, PNG, or WebP image.', 'error');
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const clearNewImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      cropID: Number(cropId),
      cropName: cropData.cropName.trim(),
      cropType: cropData.cropType,
      region: cropData.region,
      state: cropData.state,
      district: cropData.district,
      marketPrice: Number(cropData.marketPrice),
      quantity: Number(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description,
      urgent: cropData.isUrgent,
      isUrgent: cropData.isUrgent,
      waste: cropData.isWaste,
      isWaste: cropData.isWaste,
      discountPrice: cropData.discountPrice === '' ? null : Number(cropData.discountPrice),
      status: cropData.status,
    };

    const formData = new FormData();
    formData.append('crop', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) {
      formData.append('imageFile', image);
    }

    try {
      await updateCrop(cropId, formData);
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

        <Card className="update-crop-card">
          <button
                    type="button"
                    className="chat-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <i className="fa-solid fa-chevron-left" />
          </button>

        <div className="update-crop-head">
          <div>
            <h1>Update Crop</h1>
            <p>Make changes and save your listing.</p>
          </div>
        </div>
          <form className="update-crop-form" onSubmit={handleSubmit}>
            <div className="update-crop-grid update-crop-grid--2">
              <div className="update-crop-field">
                <label htmlFor="cropName">Crop Name *</label>
                <select
                  id="cropName"
                  name="cropName"
                  required
                  value={commoditySelection}
                  onChange={handleCommodityChange}
                >
                  <option value="">Select Commodity</option>
                  {commodities.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                  <option value="OTHER">Other</option>
                </select>
                {commoditySelection === 'OTHER' ? (
                  <input
                    name="cropName"
                    value={cropData.cropName}
                    onChange={handleChange}
                    placeholder="Enter crop name"
                    required
                  />
                ) : null}
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
              <label htmlFor="region">Area</label>
              <input id="region" name="region" value={cropData.region} onChange={handleChange} />
            </div>

            <div className="update-crop-grid update-crop-grid--2">
              <div className="update-crop-field">
                <label htmlFor="state">State *</label>
                <select id="state" name="state" required value={cropData.state} onChange={handleStateChange}>
                  <option value="">Select State</option>
                  {Object.keys(statesAndDistricts).map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="update-crop-field">
                <label htmlFor="district">District *</label>
                <select
                  id="district"
                  name="district"
                  required
                  value={cropData.district}
                  onChange={handleChange}
                  disabled={!cropData.state}
                >
                  <option value="">{cropData.state ? 'Select District' : 'Select State First'}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
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

            <div className="update-crop-grid update-crop-grid--2">
              <div className="update-crop-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={cropData.status} onChange={handleChange}>
                  {CROP_STATUS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="update-crop-field">
                <label htmlFor="discountPrice">Discount Price</label>
                <input
                  id="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  name="discountPrice"
                  value={cropData.discountPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="update-crop-grid update-crop-grid--2">
              <label className="add-crop-check">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={cropData.isUrgent}
                  onChange={handleChange}
                />
                <span>Urgent sale</span>
              </label>
              <label className="add-crop-check">
                <input
                  type="checkbox"
                  name="isWaste"
                  checked={cropData.isWaste}
                  onChange={handleChange}
                />
                <span>Waste / surplus sale</span>
              </label>
            </div>

            <div className="update-crop-image-row">
              

              <label className="update-crop-upload crop-image-picker" htmlFor="cropImage">
                <input className="crop-image-input" id="cropImage" type="file" accept={ALLOWED_IMAGE_ACCEPT} onChange={handleImageChange} />
                <span>Update Image</span>
                <small>{image?.name || 'No image chosen'}</small>
              </label>
                {existingImage && !imagePreview ? (
                <div className="update-crop-preview-wrap">
                  <img src={existingImage} alt="Current crop" className="update-crop-preview" />
                  <small>Current image</small>
                </div>
              ) : null}
              {imagePreview ? (
                <div className="update-crop-preview-wrap">
                  <img src={imagePreview} alt="New crop" className="update-crop-preview" />
                  <button type="button" className="update-crop-remove" onClick={clearNewImage} aria-label="Remove selected image">
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
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
