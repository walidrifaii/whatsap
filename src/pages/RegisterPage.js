import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../services/api';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form.name, form.email, form.password);
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d0d1f 0%, #1a1a3e 100%)'
    }}>
      <div style={{
        background: '#fff', padding: 40, borderRadius: 12, width: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🚀</div>
          <h2 style={{ margin: '8px 0 4px', color: '#1a1a2e' }}>Create Account</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' }
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{label}</label>
              <input type={type} required style={inputStyle} placeholder={placeholder}
                value={form[key]} onChange={set(key)} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#25d366' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#444' };
const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd',
  fontSize: 14, boxSizing: 'border-box'
};
const btnStyle = {
  width: '100%', padding: '12px', background: '#25d366', color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8
};
