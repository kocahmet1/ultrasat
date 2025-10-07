import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/config';
import './CouponManagement.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    maxUses: '',
    applicableTiers: ['plus', 'max'],
    applicableBilling: ['monthly', 'yearly'],
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/api/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCoupons(data.coupons);
      } else {
        setError(data.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: options
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      expiryDate: '',
      maxUses: '',
      applicableTiers: ['plus', 'max'],
      applicableBilling: ['monthly', 'yearly'],
      isActive: true
    });
    setEditingCoupon(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = await getAuthToken();
      
      // Validate form
      if (!formData.code || !formData.discountValue) {
        setError('Code and discount value are required');
        return;
      }

      if (formData.discountType === 'percentage' && 
          (formData.discountValue < 0 || formData.discountValue > 100)) {
        setError('Percentage must be between 0 and 100');
        return;
      }

      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
      };

      const url = editingCoupon 
        ? `/api/coupons/${editingCoupon.id}`
        : '/api/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      } else {
        setError(data.error || 'Failed to save coupon');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      setError('Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      maxUses: coupon.maxUses?.toString() || '',
      applicableTiers: coupon.applicableTiers || ['plus', 'max'],
      applicableBilling: coupon.applicableBilling || ['monthly', 'yearly'],
      isActive: coupon.isActive
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const token = await getAuthToken();
      
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Coupon deleted successfully!');
        fetchCoupons();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setError('Failed to delete coupon');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off`;
    } else {
      return `$${coupon.discountValue} off`;
    }
  };

  if (loading) {
    return (
      <div className="coupon-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coupon-management">
      <div className="coupon-management-header">
        <h1>Coupon Management</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          Create New Coupon
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER2025"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Internal description for this coupon"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === 'percentage' ? '0-100' : '0.00'}
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Max Uses</label>
                  <input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Applicable Tiers</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.applicableTiers.includes('plus')}
                      onChange={(e) => {
                        const tiers = e.target.checked
                          ? [...formData.applicableTiers, 'plus']
                          : formData.applicableTiers.filter(t => t !== 'plus');
                        setFormData(prev => ({ ...prev, applicableTiers: tiers }));
                      }}
                    />
                    Plus
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.applicableTiers.includes('max')}
                      onChange={(e) => {
                        const tiers = e.target.checked
                          ? [...formData.applicableTiers, 'max']
                          : formData.applicableTiers.filter(t => t !== 'max');
                        setFormData(prev => ({ ...prev, applicableTiers: tiers }));
                      }}
                    />
                    Max
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Applicable Billing</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.applicableBilling.includes('monthly')}
                      onChange={(e) => {
                        const billing = e.target.checked
                          ? [...formData.applicableBilling, 'monthly']
                          : formData.applicableBilling.filter(b => b !== 'monthly');
                        setFormData(prev => ({ ...prev, applicableBilling: billing }));
                      }}
                    />
                    Monthly
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.applicableBilling.includes('yearly')}
                      onChange={(e) => {
                        const billing = e.target.checked
                          ? [...formData.applicableBilling, 'yearly']
                          : formData.applicableBilling.filter(b => b !== 'yearly');
                        setFormData(prev => ({ ...prev, applicableBilling: billing }));
                      }}
                    />
                    Yearly
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="coupons-table-container">
        {coupons.length === 0 ? (
          <div className="no-coupons">
            <p>No coupons created yet.</p>
            <p>Click "Create New Coupon" to get started.</p>
          </div>
        ) : (
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Tiers</th>
                <th>Billing</th>
                <th>Expires</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className={!coupon.isActive ? 'inactive' : ''}>
                  <td>
                    <strong>{coupon.code}</strong>
                    {coupon.description && (
                      <div className="coupon-description">{coupon.description}</div>
                    )}
                  </td>
                  <td>{getDiscountDisplay(coupon)}</td>
                  <td>{coupon.applicableTiers?.join(', ') || 'All'}</td>
                  <td>{coupon.applicableBilling?.join(', ') || 'All'}</td>
                  <td>{formatDate(coupon.expiryDate)}</td>
                  <td>
                    {coupon.timesUsed || 0}
                    {coupon.maxUses && ` / ${coupon.maxUses}`}
                  </td>
                  <td>
                    <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(coupon)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;

