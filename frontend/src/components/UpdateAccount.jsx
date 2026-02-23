import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiGet, apiFetch } from '../lib/api';
import statesWithDistricts from './StatesWithDistricts';
import ValidateToken from './ValidateToken';

export default function UpdateAccount() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [userDetails, setUserDetails] = useState({
    firstName: '', lastName: '', phoneNo: '', dob: '', state: '', district: '', aadharNo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    const endpoint = role === 'buyer' ? `/buyer/getBuyer/${farmerId}` : `/users/getFarmer/${farmerId}`;
    apiGet(endpoint)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUserDetails(data))
      .catch(() => navigate('/account'))
      .finally(() => setLoading(false));
  }, []);

  const validate = (name, value) => {
    const errs = { ...errors };
    if (name === 'firstName') {
      /^[a-zA-Z\s]{2,}$/.test(value) ? delete errs.firstName : (errs.firstName = 'Min 2 letters, alphabets only.');
    }
    if (name === 'phoneNo') {
      (/^\d{10}$/.test(value) && /^[6-9]/.test(value)) ? delete errs.phoneNo : (errs.phoneNo = 'Enter valid 10-digit phone starting with 6-9.');
    }
    if (name === 'aadharNo') {
      /^\d{12}$/.test(value) ? delete errs.aadharNo : (errs.aadharNo = 'Aadhaar must be exactly 12 digits.');
    }
    if (name === 'dob') {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      age >= 18 ? delete errs.dob : (errs.dob = 'You must be at least 18 years old.');
    }
    setErrors(errs);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleStateChange = (e) => {
    setUserDetails(prev => ({ ...prev, state: e.target.value, district: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) { showToast('Please fix validation errors first.', 'error'); return; }
    setSaving(true);
    const endpoint = role === 'buyer' ? `/buyer/update/${farmerId}` : `/users/update/${farmerId}`;
    try {
      const res = await apiFetch(endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userDetails),
      });
      if (res.ok) {
        showToast('Account updated successfully! Redirecting…', 'success');
        setTimeout(() => navigate('/account'), 1500);
      } else {
        showToast('Update failed. Please try again.', 'error');
      }
    } catch { showToast('Server busy. Try again.', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
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
          <h1 className="section-title text-3xl">Edit Account</h1>
          <p className="section-subtitle">Update your personal details.</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" name="firstName" value={userDetails.firstName} onChange={handleChange} />
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="lastName" value={userDetails.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" name="phoneNo" value={userDetails.phoneNo} onChange={handleChange} />
              {errors.phoneNo && <p className="form-error">{errors.phoneNo}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" name="dob" value={userDetails.dob} onChange={handleChange} />
              {errors.dob && <p className="form-error">{errors.dob}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-select" name="state" value={userDetails.state} onChange={handleStateChange}>
                <option value="">Select State</option>
                {Object.keys(statesWithDistricts).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <select className="form-select" name="district" value={userDetails.district} onChange={handleChange} disabled={!userDetails.state}>
                <option value="">Select District</option>
                {userDetails.state && statesWithDistricts[userDetails.state]?.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input className="form-input" name="aadharNo" maxLength={12} value={userDetails.aadharNo} onChange={handleChange} />
            {errors.aadharNo && <p className="form-error">{errors.aadharNo}</p>}
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={saving || !!Object.keys(errors).length}>
            {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
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
