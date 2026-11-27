import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [emel, setEmel] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { emel, password });
      login(res.data.user, res.data.token);
      toast.success(`Selamat datang, ${res.data.user.nama}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.mesej || 'Log masuk gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logo}>🎓</div>
          <h1 style={styles.title}>Dashboard Latihan Staf</h1>
          <p style={styles.subtitle}>Sistem Pengurusan KPI Latihan</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Emel</label>
            <input
              type="email"
              value={emel}
              onChange={(e) => setEmel(e.target.value)}
              placeholder="emel@syarikat.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Kata Laluan</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Sedang log masuk...' : 'Log Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '40px',
    width: '100%', maxWidth: '400px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  logoArea: { textAlign: 'center', marginBottom: '28px' },
  logo: { fontSize: '48px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e3a5f', margin: '8px 0 4px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none',
  },
  btn: {
    width: '100%', padding: '12px', backgroundColor: '#1e3a5f', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px',
  },
};
