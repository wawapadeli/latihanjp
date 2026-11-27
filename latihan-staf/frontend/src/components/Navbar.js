import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        🎓 Latihan Staf
      </div>
      <div style={styles.links}>
        {user?.role === 'staf' && (
          <>
            <Link to="/dashboard" style={isActive('/dashboard') ? styles.linkActive : styles.link}>Dashboard</Link>
            <Link to="/kursus/tambah" style={isActive('/kursus/tambah') ? styles.linkActive : styles.link}>Tambah Kursus</Link>
            <Link to="/kursus" style={isActive('/kursus') ? styles.linkActive : styles.link}>Rekod Saya</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" style={isActive('/admin') ? styles.linkActive : styles.link}>Dashboard Admin</Link>
            <Link to="/admin/staf" style={isActive('/admin/staf') ? styles.linkActive : styles.link}>Urus Staf</Link>
            <Link to="/admin/kursus" style={isActive('/admin/kursus') ? styles.linkActive : styles.link}>Semak Kursus</Link>
          </>
        )}
      </div>
      <div style={styles.userInfo}>
        <span style={styles.nama}>👤 {user?.nama}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Log Keluar</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: '60px', backgroundColor: '#1e3a5f', color: '#fff',
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  brand: { fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' },
  links: { display: 'flex', gap: '8px' },
  link: {
    color: '#a8c4e0', textDecoration: 'none', padding: '6px 14px',
    borderRadius: '6px', fontSize: '14px', transition: 'background 0.2s',
  },
  linkActive: {
    color: '#fff', textDecoration: 'none', padding: '6px 14px',
    borderRadius: '6px', fontSize: '14px', backgroundColor: '#2563eb',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  nama: { fontSize: '14px', color: '#a8c4e0' },
  logoutBtn: {
    padding: '6px 14px', backgroundColor: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
  },
};
