import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import KpiProgressCard from '../components/KpiProgressCard';
import { Link } from 'react-router-dom';

export default function DashboardStaf() {
  const { user } = useAuth();
  const tahunSemasa = new Date().getFullYear();
  const [kpi, setKpi] = useState(null);
  const [kursus, setKursus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(tahunSemasa);

  useEffect(() => {
    fetchData();
  }, [tahun]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, kursusRes] = await Promise.all([
        api.get(`/kpi/saya?tahun=${tahun}`),
        api.get(`/kursus?tahun=${tahun}`),
      ]);
      setKpi(kpiRes.data);
      setKursus(kursusRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const badgeStatus = (status) => {
    const map = {
      menunggu: { text: 'Menunggu', bg: '#fef3c7', color: '#d97706' },
      diluluskan: { text: 'Diluluskan', bg: '#dcfce7', color: '#16a34a' },
      ditolak: { text: 'Ditolak', bg: '#fee2e2', color: '#dc2626' },
    };
    const s = map[status] || map.menunggu;
    return (
      <span style={{ backgroundColor: s.bg, color: s.color, padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Selamat Datang, {user?.nama} 👋</h1>
          <p style={styles.sub}>{user?.jabatan} · No. Pekerja: {user?.no_pekerja}</p>
        </div>
        <div style={styles.tahunPicker}>
          <label style={{ fontSize: '13px', color: '#64748b', marginRight: '8px' }}>Tahun:</label>
          <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={styles.select}>
            {[tahunSemasa, tahunSemasa - 1, tahunSemasa - 2].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuatkan data...</div>
      ) : (
        <>
          {kpi && (
            <KpiProgressCard
              jumlah_jam={kpi.jumlah_jam}
              jumlah_hari={kpi.jumlah_hari}
              bilangan_kursus={kpi.bilangan_kursus}
              min_jam={kpi.min_jam}
              min_hari={kpi.min_hari}
            />
          )}

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 Rekod Kursus {tahun}</h2>
            <Link to="/kursus/tambah" style={styles.addBtn}>+ Tambah Kursus</Link>
          </div>

          {kursus.length === 0 ? (
            <div style={styles.empty}>
              Tiada rekod kursus untuk tahun {tahun}.<br />
              <Link to="/kursus/tambah" style={{ color: '#2563eb' }}>Tambah kursus pertama anda →</Link>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Nama Kursus</th>
                    <th style={styles.th}>Penganjur</th>
                    <th style={styles.th}>Tarikh Mula</th>
                    <th style={styles.th}>Tarikh Tamat</th>
                    <th style={styles.th}>Jam</th>
                    <th style={styles.th}>Hari</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kursus.map((k) => (
                    <tr key={k.id} style={styles.tr}>
                      <td style={styles.td}>{k.nama_kursus}</td>
                      <td style={styles.td}>{k.penganjur || '-'}</td>
                      <td style={styles.td}>{new Date(k.tarikh_mula).toLocaleDateString('ms-MY')}</td>
                      <td style={styles.td}>{new Date(k.tarikh_tamat).toLocaleDateString('ms-MY')}</td>
                      <td style={styles.td}>{k.jumlah_jam} jam</td>
                      <td style={styles.td}>{k.jumlah_hari} hari</td>
                      <td style={styles.td}>{badgeStatus(k.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { margin: '0 0 4px', fontSize: '22px', color: '#1e3a5f', fontWeight: '700' },
  sub: { margin: 0, fontSize: '14px', color: '#64748b' },
  tahunPicker: { display: 'flex', alignItems: 'center' },
  select: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '48px', color: '#64748b' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sectionTitle: { margin: 0, fontSize: '16px', color: '#1e3a5f' },
  addBtn: {
    backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none',
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc',
    borderRadius: '10px', color: '#64748b', lineHeight: '2',
  },
  tableWrapper: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f1f5f9' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' },
  tr: { borderTop: '1px solid #e2e8f0' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#374151' },
};
