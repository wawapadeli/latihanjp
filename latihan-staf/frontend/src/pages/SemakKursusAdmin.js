import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SemakKursusAdmin() {
  const [kursus, setKursus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('menunggu');

  useEffect(() => {
    fetchKursus();
  }, [tahun]);

  const fetchKursus = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kursus?tahun=${tahun}`);
      setKursus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const kemaskiniStatus = async (id, status) => {
    try {
      await api.patch(`/kursus/${id}/status`, { status });
      toast.success(`Kursus berjaya ${status === 'diluluskan' ? 'diluluskan' : 'ditolak'}.`);
      fetchKursus();
    } catch (err) {
      toast.error(err.response?.data?.mesej || 'Gagal kemaskini status.');
    }
  };

  const kursusFilter = kursus.filter((k) => filterStatus === 'semua' || k.status === filterStatus);

  const badgeStatus = (status) => {
    const map = {
      menunggu: { text: 'Menunggu', bg: '#fef3c7', color: '#d97706' },
      diluluskan: { text: 'Diluluskan', bg: '#dcfce7', color: '#16a34a' },
      ditolak: { text: 'Ditolak', bg: '#fee2e2', color: '#dc2626' },
    };
    const s = map[status];
    return <span style={{ backgroundColor: s.bg, color: s.color, padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{s.text}</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Semak & Luluskan Kursus</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={styles.select}>
            {[new Date().getFullYear(), new Date().getFullYear() - 1].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
            <option value="menunggu">Menunggu Kelulusan</option>
            <option value="diluluskan">Diluluskan</option>
            <option value="ditolak">Ditolak</option>
            <option value="semua">Semua</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuatkan...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Staf</th>
                <th style={styles.th}>Jabatan</th>
                <th style={styles.th}>Nama Kursus</th>
                <th style={styles.th}>Tarikh</th>
                <th style={styles.th}>Jam</th>
                <th style={styles.th}>Hari</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {kursusFilter.map((k) => (
                <tr key={k.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>{k.nama_staf}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{k.no_pekerja}</div>
                  </td>
                  <td style={styles.td}>{k.jabatan}</td>
                  <td style={styles.td}>
                    <div>{k.nama_kursus}</div>
                    {k.penganjur && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{k.penganjur}</div>}
                  </td>
                  <td style={styles.td}>
                    {new Date(k.tarikh_mula).toLocaleDateString('ms-MY')} –<br />
                    {new Date(k.tarikh_tamat).toLocaleDateString('ms-MY')}
                  </td>
                  <td style={styles.td}>{k.jumlah_jam} j</td>
                  <td style={styles.td}>{k.jumlah_hari} h</td>
                  <td style={styles.td}>{badgeStatus(k.status)}</td>
                  <td style={styles.td}>
                    {k.status === 'menunggu' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => kemaskiniStatus(k.id, 'diluluskan')} style={styles.btnLulus}>✅ Lulus</button>
                        <button onClick={() => kemaskiniStatus(k.id, 'ditolak')} style={styles.btnTolak}>❌ Tolak</button>
                      </div>
                    )}
                    {k.status !== 'menunggu' && (
                      <button onClick={() => kemaskiniStatus(k.id, 'menunggu')} style={styles.btnReset}>↩ Reset</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {kursusFilter.length === 0 && (
            <div style={styles.empty}>Tiada rekod kursus untuk paparan ini.</div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: 0, fontSize: '20px', color: '#1e3a5f' },
  select: { padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '48px', color: '#64748b' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f1f5f9' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#374151', verticalAlign: 'top' },
  btnLulus: { padding: '5px 10px', backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  btnTolak: { padding: '5px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  btnReset: { padding: '5px 10px', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
};
