# IMS Frontend Implementation Guide

## Project Structure

```
ims-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── EmailVerificationPopup.jsx
│   │   │   └── PasswordChangeForm.jsx
│   │   ├── inventory/
│   │   │   ├── DeviceCard.jsx
│   │   │   ├── DeviceList.jsx
│   │   │   ├── DeviceRequestForm.jsx
│   │   │   └── ConsentForm.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── PendingRequestsList.jsx
│   │   │   ├── ConsentReviewPanel.jsx
│   │   │   └── DeviceGrantButton.jsx
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── MyAssignmentsPage.jsx
│   │   │   ├── MyTicketsPage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── chatbot/
│   │   │   ├── IssueChatbot.jsx
│   │   │   └── ChatMessage.jsx
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── SignupPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── UserPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── UnauthorizedPage.jsx
│   ├── services/
│   │   ├── api.js (already exists - update)
│   │   ├── auth.js (new)
│   │   ├── inventory.js (new)
│   │   └── admin.js (new)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useNotification.js
│   │   └── useDevice.js
│   ├── context/
│   │   ├── AuthContext.jsx (already exists - update)
│   │   └── NotificationContext.jsx (new)
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## Key UI Components to Build

### 1️⃣ Email Verification Popup (after login)

**Location:** `components/auth/EmailVerificationPopup.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { sendOTP, verifyOTP, changePassword } from '../../services/auth';

export const EmailVerificationPopup = ({ email, onClose, onSuccess }) => {
  const [step, setStep] = useState('send'); // send → verify → change
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await sendOTP(email);
      setStep('verify');
    } catch (error) {
      alert('Failed to send OTP: ' + error.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      setStep('change');
    } catch (error) {
      alert('Invalid OTP: ' + error.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await changePassword(email, otp, newPassword);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Failed to change password: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Email Verification Required</h2>
        
        {step === 'send' && (
          <>
            <p>Verify your email to complete signup.</p>
            <button onClick={handleSendOTP} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            <p>Enter the OTP sent to {email}</p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 'change' && (
          <>
            <p>Set a new password (optional)</p>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <button onClick={onClose} variant="secondary">
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

---

### 2️⃣ Device Request Form

**Location:** `components/inventory/DeviceRequestForm.jsx`

```jsx
import React, { useState } from 'react';
import { createDeviceRequest } from '../../services/inventory';

export const DeviceRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    device_type: 'laptop',
    brand: '',
    model: '',
    specifications: {},
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDeviceRequest(formData);
      alert('Device request submitted successfully!');
      onSuccess?.();
    } catch (error) {
      alert('Failed to submit request: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="device-request-form">
      <h2>Request a Device</h2>

      <div>
        <label>Device Type *</label>
        <select
          value={formData.device_type}
          onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
        >
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop</option>
          <option value="monitor">Monitor</option>
          <option value="keyboard">Keyboard</option>
          <option value="mouse">Mouse</option>
          <option value="headset">Headset</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      <div>
        <label>Brand</label>
        <input
          type="text"
          placeholder="e.g., HP, Dell, Apple"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
        />
      </div>

      <div>
        <label>Model</label>
        <input
          type="text"
          placeholder="e.g., EliteBook 840, Pavilion 15"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        />
      </div>

      <div>
        <label>Reason for Request *</label>
        <textarea
          placeholder="Explain why you need this device..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={loading || !formData.reason}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};
```

---

### 3️⃣ Consent Form

**Location:** `components/inventory/ConsentForm.jsx`

```jsx
import React, { useState } from 'react';
import { submitConsent } from '../../services/inventory';

export const ConsentForm = ({ assignmentId, deviceDetails, onSuccess }) => {
  const [formData, setFormData] = useState({
    condition_at_receipt: 'good',
    acknowledgment: false,
    signature: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Convert to base64 or upload to service
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.acknowledgment) {
      alert('Please acknowledge the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      await submitConsent(assignmentId, {
        consent_form_data: formData,
        consent_images: images,
      });
      alert('Consent form submitted successfully!');
      onSuccess?.();
    } catch (error) {
      alert('Failed to submit consent: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="consent-form">
      <h2>Device Consent Form</h2>

      <div className="device-info">
        <h3>Device Details</h3>
        <p><strong>Device ID:</strong> {deviceDetails.device_id}</p>
        <p><strong>Device:</strong> {deviceDetails.brand} {deviceDetails.model}</p>
        <p><strong>Type:</strong> {deviceDetails.device_type}</p>
      </div>

      <div>
        <label>Device Condition at Receipt *</label>
        <select
          value={formData.condition_at_receipt}
          onChange={(e) => setFormData({ ...formData, condition_at_receipt: e.target.value })}
        >
          <option value="new">New</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <label>Upload Device Photos *</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        <p>{images.length} images uploaded</p>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.acknowledgment}
            onChange={(e) => setFormData({ ...formData, acknowledgment: e.target.checked })}
          />
          I acknowledge and agree to the terms of device usage
        </label>
      </div>

      <div>
        <label>Digital Signature *</label>
        <canvas
          id="signature-canvas"
          style={{ border: '1px solid #ccc', width: '100%', height: '150px' }}
          ref={(canvas) => {
            if (canvas) {
              canvas.onmousedown = (e) => {
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.moveTo(e.offsetX, e.offsetY);
                canvas.onmousemove = (me) => {
                  ctx.lineTo(me.offsetX, me.offsetY);
                  ctx.stroke();
                };
                canvas.onmouseup = () => {
                  canvas.onmousemove = null;
                  setFormData({
                    ...formData,
                    signature: canvas.toDataURL(),
                  });
                };
              };
            }
          }}
        />
      </div>

      <button type="submit" disabled={loading || !formData.acknowledgment}>
        {loading ? 'Submitting...' : 'Submit Consent Form'}
      </button>
    </form>
  );
};
```

---

### 4️⃣ Admin Device Grant Panel

**Location:** `components/admin/DeviceGrantButton.jsx`

```jsx
import React, { useState } from 'react';
import { grantDevice } from '../../services/admin';

export const DeviceGrantButton = ({ assignmentId, assignment, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    if (!window.confirm('Send device grant notification emails to all recipients?')) {
      return;
    }
    setLoading(true);
    try {
      const result = await grantDevice(assignmentId);
      alert(`Device granted successfully!\n\nEmails sent to:\n${result.emails_sent_to.join('\n')}`);
      onSuccess?.();
    } catch (error) {
      alert('Failed to grant device: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="grant-panel">
      <div className="assignment-details">
        <h3>Device Grant</h3>
        <p><strong>Device:</strong> {assignment.device.device_id}</p>
        <p><strong>Employee:</strong> {assignment.employee.full_name}</p>
        <p><strong>Employee ID:</strong> {assignment.employee.employee_id}</p>
        <p><strong>Status:</strong> {assignment.status}</p>
      </div>

      <div className="email-recipients">
        <h4>Recipients:</h4>
        <ul>
          <li>✉️ Employee: {assignment.employee.email}</li>
          <li>✉️ HR: jagruti@believersdestination.com</li>
          <li>✉️ Admin: kunal@believersdestination.com</li>
          <li>✉️ Finance: varun@believersdestination.com</li>
          <li>✉️ HR Manager: chahat.gupta@believersdestination.com</li>
        </ul>
      </div>

      <button
        className="btn-grant"
        onClick={handleGrant}
        disabled={loading || assignment.status !== 'active'}
      >
        {loading ? 'Granting...' : '🎯 Grant Device & Send Notifications'}
      </button>
    </div>
  );
};
```

---

### 5️⃣ Chatbot Component (Issue Reporter)

**Location:** `components/chatbot/IssueChatbot.jsx`

```jsx
import React, { useState } from 'react';
import { createTicket } from '../../services/inventory';

export const IssueChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! How can I help you today? You can report an issue, request a device, or ask a question.' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: input }]);

    if (input.toLowerCase().includes('issue') || input.toLowerCase().includes('problem')) {
      // Create ticket
      try {
        await createTicket({
          ticket_type: 'issue',
          subject: input,
          description: input,
          priority: 'medium',
        });
        setMessages(prev => [...prev, { type: 'bot', text: 'Issue reported successfully. Admin will contact you soon.' }]);
      } catch (error) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Error reporting issue. Please try again.' }]);
      }
    } else {
      setMessages(prev => [...prev, { type: 'bot', text: 'Thanks for your message. Our team will get back to you shortly.' }]);
    }

    setInput('');
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Support Chatbot</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};
```

---

## API Service Functions

### `src/services/auth.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const authService = {
  signup: (email, password, firstName, lastName) =>
    axios.post(`${API_BASE_URL}/auth/signup/`, {
      email, password, first_name: firstName, last_name: lastName
    }),

  login: (email, password) =>
    axios.post(`${API_BASE_URL}/auth/login/`, { email, password }),

  sendOTP: (email) =>
    axios.post(`${API_BASE_URL}/auth/email/send-otp/`, { email }),

  verifyOTP: (email, otp) =>
    axios.post(`${API_BASE_URL}/auth/email/verify-otp/`, { email, otp }),

  changePassword: (email, otp, newPassword) =>
    axios.post(`${API_BASE_URL}/auth/email/change-password/`, {
      email, otp, new_password: newPassword
    }),

  getCurrentUser: (token) =>
    axios.get(`${API_BASE_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};
```

### `src/services/inventory.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const inventoryService = {
  getAvailableDevices: (token) =>
    axios.get(`${API_BASE_URL}/inventory/devices/?status=available`, getHeaders(token)),

  createDeviceRequest: (token, data) =>
    axios.post(`${API_BASE_URL}/inventory/device-requests/`, data, getHeaders(token)),

  getPendingRequests: (token) =>
    axios.get(`${API_BASE_URL}/inventory/device-requests/?status=pending`, getHeaders(token)),

  approveRequest: (token, requestId) =>
    axios.post(`${API_BASE_URL}/inventory/device-requests/${requestId}/approve/`, {}, getHeaders(token)),

  submitConsent: (token, assignmentId, data) =>
    axios.post(`${API_BASE_URL}/inventory/assignments/${assignmentId}/submit-consent/`, data, getHeaders(token)),

  getPendingConsents: (token) =>
    axios.get(`${API_BASE_URL}/inventory/assignments/?status=consent_pending`, getHeaders(token)),

  approveConsent: (token, assignmentId) =>
    axios.post(`${API_BASE_URL}/inventory/assignments/${assignmentId}/approve-consent/`, {}, getHeaders(token)),

  getMyAssignments: (token) =>
    axios.get(`${API_BASE_URL}/inventory/assignments/my-assignments/`, getHeaders(token)),

  createTicket: (token, data) =>
    axios.post(`${API_BASE_URL}/inventory/tickets/`, data, getHeaders(token)),
};
```

### `src/services/admin.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const adminService = {
  grantDevice: (token, assignmentId) =>
    axios.post(
      `${API_BASE_URL}/inventory/assignments/${assignmentId}/grant-device/`,
      {},
      getHeaders(token)
    ),

  getDashboardStats: (token) =>
    axios.get(`${API_BASE_URL}/inventory/dashboard/`, getHeaders(token)),

  getAllAssignments: (token) =>
    axios.get(`${API_BASE_URL}/inventory/assignments/`, getHeaders(token)),

  getAllTickets: (token) =>
    axios.get(`${API_BASE_URL}/inventory/tickets/`, getHeaders(token)),
};
```

---

## Main App Routes

**Update `src/App.jsx`:**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext/AuthContext';
import SignupPage from './pages/signupPage/SignupPage';
import LoginPage from './pages/loginPage/LoginPage';
import UserPage from './pages/userPage/UserPage';
import AdminPage from './pages/adminPage/AdminPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={user ? <UserPage /> : <UnauthorizedPage />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <UnauthorizedPage />} />
        <Route path="/" element={user ? (user.role === 'admin' ? <AdminPage /> : <UserPage />) : <LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## CSS/Styling Tips

```css
/* Modal for email verification */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Chatbot positioning */
.chatbot-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  border: none;
  background: #007bff;
  cursor: pointer;
}

.chatbot-window {
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: 20px;
  text-align: right;
}

.message.bot {
  background: #f0f0f0;
  margin-right: 20px;
  text-align: left;
}
```

---

## Environment Configuration

Create `.env` in `ims-frontend/`:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=IMS
REACT_APP_VERSION=1.0.0
```

---

## Installation & Setup

```bash
cd ims-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Testing Checklist

- [ ] Signup works → email verification popup appears
- [ ] OTP verified → can login
- [ ] Login → shows available devices
- [ ] Request device → admin receives notification
- [ ] Admin approves → user sees consent form
- [ ] Consent submitted → admin can review
- [ ] Admin approves consent → device becomes active
- [ ] Admin grants device → all 5 recipients get emails
- [ ] Device appears in "My Assignments"
- [ ] Chatbot works for issue reporting

---

**Ready to start building the UI!** 🚀
