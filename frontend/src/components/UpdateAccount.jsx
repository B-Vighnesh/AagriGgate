import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import statesWithDistricts from './StatesWithDistricts';
import { apiFetch, apiGet } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';

export default function UpdateAccount() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    dob: '',
    state: '',
    district: '',
    aadharNo: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  useEffect(() => {
    if (!role || !token || !farmerId) {
      navigate('/login');
      return;
    }

    const endpoint = role === 'buyer'
      ? `/buyer/getBuyer/${farmerId}`
      : `/users/getFarmer/${farmerId}`;

    (async () => {
      try {
        const response = await apiGet(endpoint);
        if (!response.ok) throw new Error('Unable to load account details.');
        const data = await response.json();
        setForm({
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          phoneNo: data?.phoneNo || '',
          dob: data?.dob || '',
          state: data?.state || '',
          district: data?.district || '',
          aadharNo: data?.aadharNo || '',
        });
      } catch {
        navigate('/account');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validate = (name, value) => {
    setErrors((prev) => {
      const next = { ...prev };

      if (name === 'firstName') {
        if (!/^[a-zA-Z\s]{2,}$/.test(value)) next.firstName = 'Minimum 2 letters, alphabets only.';
        else delete next.firstName;
      }

      if (name === 'phoneNo') {
        if (!(/^\d{10}$/.test(value) && /^[6-9]/.test(value))) next.phoneNo = 'Enter valid 10-digit number starting with 6-9.';
        else delete next.phoneNo;
      }

      if (name === 'aadharNo') {
        if (!/^\d{12}$/.test(value)) next.aadharNo = 'Aadhaar must be exactly 12 digits.';
        else delete next.aadharNo;
      }

      if (name === 'dob') {
        const years = new Date().getFullYear() - new Date(value).getFullYear();
        if (!value || Number.isNaN(years) || years < 18) next.dob = 'You must be at least 18 years old.';
        else delete next.dob;
      }

      return next;
    });
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const onStateChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, state: value, district: '' }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      showToast('Please fix validation errors first.', 'error');
      return;
    }

    setSaving(true);
    const endpoint = role === 'buyer'
      ? `/buyer/update/${farmerId}`
      : `/users/update/${farmerId}`;

    try {
      const response = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Update failed. Please try again.');
      showToast('Account updated successfully.', 'success');
      setTimeout(() => navigate('/account'), 700);
    } catch (err) {
      showToast(err.message || 'Server busy. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page update-account-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="update-account-head">
          {/* <button type="button" className="link-back" onClick={() => navigate(-1)}>Back</button> */}
          <div>
            <h1>Edit Account</h1>
            <p>Update your personal details.</p>
          </div>
        </div>

        <Card className="update-account-card">
          <form className="update-account-form" onSubmit={onSubmit}>
            <div className="update-account-grid update-account-grid--2">
              <div className="update-account-field">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={onChange} />
                {errors.firstName ? <small>{errors.firstName}</small> : null}
              </div>
              <div className="update-account-field">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={onChange} />
              </div>
            </div>

            <div className="update-account-grid update-account-grid--2">
              <div className="update-account-field">
                <label htmlFor="phoneNo">Phone Number</label>
                <input id="phoneNo" name="phoneNo" value={form.phoneNo} onChange={onChange} />
                {errors.phoneNo ? <small>{errors.phoneNo}</small> : null}
              </div>
              <div className="update-account-field">
                <label htmlFor="dob">Date of Birth</label>
                <input id="dob" type="date" name="dob" value={form.dob} onChange={onChange} />
                {errors.dob ? <small>{errors.dob}</small> : null}
              </div>
            </div>

            <div className="update-account-grid update-account-grid--2">
              <div className="update-account-field">
                <label htmlFor="state">State</label>
                <select id="state" name="state" value={form.state} onChange={onStateChange}>
                  <option value="">Select State</option>
                  {Object.keys(statesWithDistricts).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="update-account-field">
                <label htmlFor="district">District</label>
                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={onChange}
                  disabled={!form.state}
                >
                  <option value="">Select District</option>
                  {(statesWithDistricts[form.state] || []).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="update-account-field">
              <label htmlFor="aadharNo">Aadhaar Number</label>
              <input id="aadharNo" name="aadharNo" value={form.aadharNo} maxLength={12} onChange={onChange} />
              {errors.aadharNo ? <small>{errors.aadharNo}</small> : null}
            </div>

            <Button type="submit" loading={saving} disabled={Object.keys(errors).length > 0}>
              {saving ? 'Saving changes...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
