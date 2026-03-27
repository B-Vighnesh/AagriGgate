import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import { addCrop } from '../api/cropApi';
import statesAndDistricts from './statesAndDistricts';
import commodities from './commodities';

const CROP_TYPES = ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Spice', 'Oil Seed', 'Flower', 'Other'];
const UNITS = ['kg', 'ltr', 'g', 'piece', 'quintal', 'ton'];
const CROP_STATUS = ['available', 'sold'];

export default function AddCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [cropData, setCropData] = useState({
    cropName: '',
    cropType: '',
    city: '',
    district: '',
    state: '',
    marketPrice: '',
    quantity: '',
    unit: 'kg',
    description: '',
    isUrgent: false,
    isWaste: false,
    discountPrice: '',
    status: 'available',
  });
  const [commoditySelection, setCommoditySelection] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const districts = statesAndDistricts[cropData.state] || [];

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
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCropData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onStateChange = (event) => {
    const value = event.target.value;
    setCropData((prev) => ({
      ...prev,
      state: value,
      district: '',
    }));
  };

  const onCommodityChange = (event) => {
    const value = event.target.value;
    setCommoditySelection(value);
    setCropData((prev) => ({
      ...prev,
      cropName: value === 'OTHER' ? '' : value,
    }));
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

    const region = [cropData.city, cropData.district, cropData.state]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ');

    if (!region) {
      showToast('Please enter city, district, and state.', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    const payload = {
      cropName: cropData.cropName.trim(),
      cropType: cropData.cropType,
      region,
      marketPrice: Number(cropData.marketPrice),
      quantity: Number(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description.trim(),
      isUrgent: cropData.isUrgent,
      isWaste: cropData.isWaste,
      discountPrice: cropData.discountPrice === '' ? null : Number(cropData.discountPrice),
      status: cropData.status,
    };

    formData.append('crop', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) formData.append('imageFile', image);

    try {
      const response = await addCrop(formData);

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
                <select
                  id="cropName"
                  name="cropName"
                  value={commoditySelection}
                  onChange={onCommodityChange}
                  required
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
                    onChange={onFieldChange}
                    placeholder="Enter crop name"
                    required
                  />
                ) : null}
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

            <div className="add-crop-grid add-crop-grid--3">
              <div className="add-crop-field">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  value={cropData.city}
                  onChange={onFieldChange}
                  placeholder="e.g. Mysuru"
                  required
                />
              </div>
              <div className="add-crop-field">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={cropData.state}
                  onChange={onStateChange}
                  required
                >
                  <option value="">Select State</option>
                  {Object.keys(statesAndDistricts).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="add-crop-field">
                <label htmlFor="district">District *</label>
                <select
                  id="district"
                  name="district"
                  value={cropData.district}
                  onChange={onFieldChange}
                  disabled={!cropData.state}
                  required
                >
                  <option value="">{cropData.state ? 'Select District' : 'Select State First'}</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
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

            <div className="add-crop-grid add-crop-grid--2">
              <div className="add-crop-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={cropData.status} onChange={onFieldChange}>
                  {CROP_STATUS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="add-crop-field">
                <label htmlFor="discountPrice">Discount Price (Optional)</label>
                <input
                  id="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  name="discountPrice"
                  value={cropData.discountPrice}
                  onChange={onFieldChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="add-crop-grid add-crop-grid--2">
              <label className="add-crop-check">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={cropData.isUrgent}
                  onChange={onFieldChange}
                />
                <span>Mark this as urgent sale</span>
              </label>
              <label className="add-crop-check">
                <input
                  type="checkbox"
                  name="isWaste"
                  checked={cropData.isWaste}
                  onChange={onFieldChange}
                />
                <span>Mark this as waste / surplus sale</span>
              </label>
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
