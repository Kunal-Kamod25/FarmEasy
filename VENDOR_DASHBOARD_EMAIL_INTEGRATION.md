# Vendor Dashboard - Order Management & Email Integration

## Overview
This guide shows how to integrate the email system into the vendor dashboard for managing orders and triggering email notifications.

## 🎯 Use Cases

1. **Vendor receives order** → Updates status to "Confirmed" → Email sent
2. **Vendor prepares shipment** → Updates to "Shipped" + adds tracking → Email sent
3. **Delivery driver delivered** → Updates to "Delivered" → Email sent
4. **Out of stock situation** → Updates to "Cancelled" + adds reason → Email sent

## 📋 Prerequisites

- Vendor dashboard component exists in frontend
- Vendor has JWT token from login
- Backend API ready: `PUT /api/orders/:orderId/status`

## 🔗 Frontend Integration

### 1. Create Order Status Update Service

**File: `frontend/src/services/orderService.js`** (or add to existing)

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get vendor's orders
export const getVendorOrders = async (token) => {
  const response = await axios.get(`${API_URL}/api/vendor/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update order status (triggers email)
export const updateOrderStatus = async (orderId, status, additionalData = {}, token) => {
  const payload = {
    status: status,
    ...additionalData  // trackingUrl, cancellationReason
  };

  const response = await axios.put(
    `${API_URL}/api/orders/${orderId}/status`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Status constants matching backend
export const ORDER_STATUS = {
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  ORDER_PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};
```

### 2. Create Order Status Update Modal

**File: `frontend/src/components/VendorDashboard/OrderStatusModal.jsx`**

```javascript
import React, { useState } from 'react';
import { updateOrderStatus, ORDER_STATUS } from '../../services/orderService';

export default function OrderStatusModal({ order, onClose, onSuccess, token }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingUrl, setTrackingUrl] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        trackingUrl: trackingUrl.trim() || undefined,
        cancellationReason: cancellationReason.trim() || undefined
      };

      await updateOrderStatus(order.id, newStatus, payload, token);

      // Success toast/notification
      alert(`✅ Order updated to ${newStatus}\n📧 Email sent to customer`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
      alert(`❌ ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Order #{order.id} Status</h2>

        {/* Current Status */}
        <div className="form-group">
          <label>Current Status: <strong>{order.status}</strong></label>
        </div>

        {/* New Status Dropdown */}
        <div className="form-group">
          <label htmlFor="status">New Status:</label>
          <select
            id="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="form-control"
          >
            <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
            <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
            <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
            <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
          </select>
          <small className="text-muted">📧 Appropriate email will be sent to customer</small>
        </div>

        {/* Tracking URL (for Shipped) */}
        {newStatus === ORDER_STATUS.SHIPPED && (
          <div className="form-group">
            <label htmlFor="trackingUrl">Tracking URL (Optional):</label>
            <input
              id="trackingUrl"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://track.example.com/order/123"
              className="form-control"
            />
            <small className="text-info">
              ✉️ Customer will receive tracking link in email
            </small>
          </div>
        )}

        {/* Cancellation Reason (for Cancelled) */}
        {newStatus === ORDER_STATUS.CANCELLED && (
          <div className="form-group">
            <label htmlFor="reason">Cancellation Reason (Optional):</label>
            <textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Out of stock, Customer requested, Technical issue"
              className="form-control"
              rows="3"
            />
            <small className="text-warning">
              ⚠️ Customer will see this reason in cancellation email
            </small>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-buttons">
          <button
            onClick={handleStatusUpdate}
            disabled={loading || newStatus === order.status}
            className="btn btn-primary"
          >
            {loading ? 'Updating...' : '✉️ Update & Send Email'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>

        {/* Email Preview Info */}
        <div className="info-box" style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <strong>Email Preview:</strong>
          <ul>
            {newStatus === ORDER_STATUS.CONFIRMED && (
              <li>✉️ "Order Confirmed" - Payment confirmation email</li>
            )}
            {newStatus === ORDER_STATUS.SHIPPED && (
              <li>✉️ "Your Order is on the Way! 📦" - Shipping notification with tracking</li>
            )}
            {newStatus === ORDER_STATUS.DELIVERED && (
              <li>✉️ "Order Delivered! ✓" - Delivery confirmation</li>
            )}
            {newStatus === ORDER_STATUS.CANCELLED && (
              <li>✉️ "Order Cancelled" - Cancellation notice with reason</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### 3. Integrate into Vendor Dashboard Orders Table

**File: `frontend/src/components/VendorDashboard/OrdersTable.jsx`** (Updated)

```javascript
import React, { useState, useEffect } from 'react';
import OrderStatusModal from './OrderStatusModal';
import { getVendorOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getVendorOrders(token);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh orders after status update
    fetchOrders();
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{order.items?.length || 0} items</td>
              <td>₹{order.total_amount}</td>
              <td>
                <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleStatusClick(order)}
                  className="btn btn-sm btn-primary"
                  title="Update order status & send email"
                >
                  📧 Update Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onSuccess={handleUpdateSuccess}
          token={token}
        />
      )}
    </>
  );
}
```

### 4. Add CSS Styles

**File: `frontend/src/styles/vendor-dashboard.css`** (Add)

```css
/* Order Status Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #2d5016;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #2d5016;
  box-shadow: 0 0 5px rgba(45, 80, 22, 0.1);
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

.text-muted {
  color: #999;
}

.text-info {
  color: #0066cc;
}

.text-warning {
  color: #ff9800;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2d5016;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1f3810;
}

.btn-secondary {
  background-color: #ddd;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #ccc;
}

.info-box {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #2d5016;
}

.info-box strong {
  color: #2d5016;
}

.info-box ul {
  list-style: none;
  padding: 8px 0 0 0;
  margin: 0;
}

.info-box li {
  padding: 4px 0;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-shipped {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-delivered {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}
```

## 📊 Workflow Example

### Scenario: Vendor receives order

1. **Vendor sees order** in dashboard with status "Order Placed"
2. **Vendor clicks** "📧 Update Status" button
3. **Modal opens** with options:
   - Status: Confirmed ✓
4. **Vendor clicks** "✉️ Update & Send Email"
5. **Backend**:
   - Updates DB: status → "Confirmed"
   - Sends email: "Order Confirmed ✓"
6. **Customer receives** payment confirmation email ✅
7. **Dashboard updates** - order now shows "Confirmed" status

### Scenario: Order shipped with tracking

1. **Vendor prepares shipment**
2. **Gets tracking URL** from logistics provider
3. **Clicks "📧 Update Status"**
4. **Selects**: "Shipped"
5. **Enters tracking URL**: `https://courier.com/track/ABC123`
6. **Clicks update**
7. **Customer receives**:
   - Email: "Your Order is on the Way! 📦"
   - Includes clickable "Track Your Order" button
   - Links to tracking URL ✅

### Scenario: Cancel order with reason

1. **Stock becomes unavailable**
2. **Vendor clicks "📧 Update Status"**
3. **Selects**: "Cancelled"
4. **Enters reason**: "Out of stock - will be available next week"
5. **Clicks update**
6. **Customer receives**:
   - Email: "Order Cancelled"
   - Shows reason: "Out of stock - will be available next week"
   - Option to contact support ✅

## 🔔 Real-Time Notifications (Optional Enhancement)

To add real-time notifications for vendors:

```javascript
// Add to VendorDashboard.jsx
import { useEffect } from 'react';

export default function VendorDashboard() {
  useEffect(() => {
    // Show toast notification after successful update
    const handleStatusUpdated = () => {
      toast.success('✅ Order updated & customer notified!');
    };

    // Listen for update success
    window.addEventListener('orderStatusUpdated', handleStatusUpdated);
    return () => window.removeEventListener('orderStatusUpdated', handleStatusUpdated);
  }, []);

  // ... rest of component
}
```

## 📱 Mobile Responsive

The modal is already mobile-responsive. For smaller screens:

```css
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
```

## 🧪 Testing the Integration

1. **Login as vendor**
2. **Navigate to Orders** page
3. **Place test order** (as customer)
4. **Click "📧 Update Status"**
5. **Change status** and add tracking URL (if Shipped)
6. **Check customer email** for corresponding notification
7. **Verify all 5 email types** work correctly

## ✅ Feature Checklist

- ✅ Get vendor's orders
- ✅ Open status update modal
- ✅ Select new status
- ✅ Add tracking URL (for Shipped)
- ✅ Add cancellation reason (for Cancelled)
- ✅ Submit and trigger email
- ✅ Show success message
- ✅ Refresh orders list
- ✅ Responsive design
- ✅ Error handling

## 🚀 Next Steps

1. Add this modal component to your vendor dashboard
2. Update import paths as needed
3. Test with real email addresses
4. Customize styles to match your theme
5. Add toast notifications for better UX
6. Monitor email delivery in backend logs

---

**Vendors now have full control over order notifications!** 📧✨
