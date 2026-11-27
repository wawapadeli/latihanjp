import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function DashboardAdmin() {
  const tahunSemasa = new Date().getFullYear();
  const [tahun, setTahun] = useState(tahunSemasa);
  const [ringkasan, setRingkasan] = useState(null);
  const [senaraistaf, setSenaraistaf] = useState([]);
  const [filterJabatan, setFilterJabatan] = useState('');
  const [jabatanList, setJabatanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tahun, filterJabatan]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tahun });
      if (filterJabatan) params.append('jabatan', filterJabatan);

      const [ringRes, stafRes, jabRes] = await Promise.all([
        api.get(`/kpi/ringkasan?tahun=${tahun}`),
        api.get(`/kpi/semua?${params}`),
        api.get('/kpi/jabatan'),
      ]);
      setRingkasan(ringRes.data);
      setSenaraistaf(stafRes.data);
      setJabatanList(jabRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dataGrafJabatan = ringkasan?.mengikut_jabatan?.map((j) => ({
    jabatan: j.jabatan.length > 12 ? j.jabatan.substring(0, 12) + '...' : j.jabatan,
    capai: parseInt(j.capai),
    belum: parseInt(j.jumlah) - parseInt(j.capai),
  })) || [];

  const dataPai = ringkasan ? [
    { name: 'Capai KPI', value: parseInt(ringkasan.keseluruhan.staf_capai_kpi), fill: '#16a34a' },
    { name: 'Belum Capai', value: parseInt(ringkasan.keseluruhan.staf_belum_capai), fill: '#dc2626' },
  ] : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard Admin — KPI Latihan Staf</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={styles.select}>
            {[tahunSemasa, tahunSemasa - 1, tahunSemasa - 2].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterJabatan} onChange={(e) => setFilterJabatan(e.target.value)} style={styles.select}>
            <option value="">Semua Jabatan</option>
            {jabatanList.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuatkan data...</div>
      ) : (
        <>
          {/* Kad Ringkasan */}
          <div style={styles.statGrid}>
            <StatCard label="Jumlah Staf" value={ringkasan?.keseluruhan?.jumlah_staf} icon="👥" color="#2563eb" />
            <StatCard label="Capai KPI" value={ringkasan?.keseluruhan?.staf_capai_kpi} icon="✅" color="#16a34a" />
            <StatCard label="Belum Capai KPI" value={ringkasan?.keseluruhan?.staf_belum_capai} icon="⚠️" color="#dc2626" />
            <StatCard label="% Capai KPI" value={`${ringkasan?.keseluruhan?.peratus_capai || 0}%`} icon="📈" color="#7c3aed" />
            <StatCard label="Purata Jam" value={`${ringkasan?.keseluruhan?.purata_jam || 0} jam`} icon="⏱️" color="#0891b2" />
            <StatCard label="Purata Hari" value={`${ringkasan?.keseluruhan?.purata_hari || 0} hari`} icon="📅" color="#d97706" />
          </div>

          {/* Carta */}
          <div style={styles.chartGrid}>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Pecahan KPI Keseluruhan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dataPai} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dataPai.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Capai KPI Mengikut Jabatan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dataGrafJabatan}>
                  <XAxis dataKey="jabatan" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="capai" name="Capai" fill="#16a34a" stackId="a" />
                  <Bar dataKey="belum" name="Belum Capai" fill="#fca5a5" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Jadual Staf */}
          <div style={styles.tableSection}>
            <h2 style={styles.sectionTitle}>📋 Senarai Staf & Status KPI {tahun}</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>No. Pekerja</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Jabatan</th>
                    <th style={styles.th}>Jam Latihan</th>
                    <th style={styles.th}>Hari Berkursus</th>
                    <th style={styles.th}>Status KPI</th>
                  </tr>
                </thead>
                <tbody>
                  {senaraistaf.map((s) => (
                    <tr key={s.user_id} style={styles.tr}>
                      <td style={styles.td}>{s.no_pekerja}</td>
                      <td style={styles.td}>{s.nama}</td>
                      <td style={styles.td}>{s.jabatan}</td>
                      <td style={styles.td}>
                        <ProgressMini nilai={s.jumlah_jam} min={s.min_jam} unit="jam" />
                      </td>
                      <td style={styles.td}>
                        <ProgressMini nilai={s.jumlah_hari} min={s.min_hari} unit="hari" />
                      </td>
                      <td style={styles.td}>
                        {s.status_kpi === 'capai'
                          ? <span style={styles.badgeCapai}>✅ Capai</span>
                          : <span style={styles.badgeBelum}>⚠️ Belum Capai</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {senaraistaf.length === 0 && (
                <div style={styles.empty}>Tiada data staf untuk paparan ini.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color, marginTop: '4px' }}>{value ?? '-'}</div>
      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function ProgressMini({ nilai, min, unit }) {
  const persen = Math.min((nilai / min) * 100, 100);
  const capai = nilai >= min;
  return (
    <div>
      <span style={{ fontSize: '13px', fontWeight: '600', color: capai ? '#16a34a' : '#dc2626' }}>{nilai}</span>
      <span style={{ fontSize: '12px', color: '#94a3b8' }}> / {min} {unit}</span>
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '999px', height: '6px', marginTop: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${persen}%`, height: '6px', backgroundColor: capai ? '#16a34a' : '#3b82f6', borderRadius: '999px' }} />
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: 0, fontSize: '20px', color: '#1e3a5f' },
  select: { padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '48px', color: '#64748b' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  chartBox: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
  chartTitle: { margin: '0 0 12px', fontSize: '14px', color: '#374151', fontWeight: '600' },
  tableSection: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
  sectionTitle: { margin: '0 0 16px', fontSize: '16px', color: '#1e3a5f' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f1f5f9' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '11px 14px', fontSize: '14px', color: '#374151' },
  badgeCapai: { backgroundColor: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  badgeBelum: { backgroundColor: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '32px', color: '#94a3b8' },
};
