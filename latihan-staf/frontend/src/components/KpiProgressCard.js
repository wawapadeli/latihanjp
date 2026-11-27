import React from 'react';

export default function KpiProgressCard({ jumlah_jam, jumlah_hari, min_jam, min_hari, bilangan_kursus }) {
  const persenJam = Math.min((jumlah_jam / min_jam) * 100, 100);
  const persenHari = Math.min((jumlah_hari / min_hari) * 100, 100);
  const kpiCapai = jumlah_jam >= min_jam && jumlah_hari >= min_hari;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Status KPI Latihan</h2>
        <span style={kpiCapai ? styles.badgeCapai : styles.badgeBelum}>
          {kpiCapai ? '✅ KPI Capai' : '⚠️ Belum Capai KPI'}
        </span>
      </div>

      <div style={styles.grid}>
        {/* Jam */}
        <div style={styles.metricBox}>
          <div style={styles.metricLabel}>⏱️ Jumlah Jam Latihan</div>
          <div style={styles.metricValue}>
            <span style={{ color: jumlah_jam >= min_jam ? '#16a34a' : '#dc2626', fontSize: '28px', fontWeight: '700' }}>
              {Number(jumlah_jam).toFixed(1)}
            </span>
            <span style={styles.metricTarget}> / {min_jam} jam</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressBar, width: `${persenJam}%`, backgroundColor: jumlah_jam >= min_jam ? '#16a34a' : '#2563eb' }} />
          </div>
          <div style={styles.persenText}>{persenJam.toFixed(1)}%</div>
        </div>

        {/* Hari */}
        <div style={styles.metricBox}>
          <div style={styles.metricLabel}>📅 Jumlah Hari Berkursus</div>
          <div style={styles.metricValue}>
            <span style={{ color: jumlah_hari >= min_hari ? '#16a34a' : '#dc2626', fontSize: '28px', fontWeight: '700' }}>
              {jumlah_hari}
            </span>
            <span style={styles.metricTarget}> / {min_hari} hari</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressBar, width: `${persenHari}%`, backgroundColor: jumlah_hari >= min_hari ? '#16a34a' : '#f59e0b' }} />
          </div>
          <div style={styles.persenText}>{persenHari.toFixed(1)}%</div>
        </div>

        {/* Bilangan kursus */}
        <div style={styles.metricBox}>
          <div style={styles.metricLabel}>🎓 Bilangan Kursus Diluluskan</div>
          <div style={styles.metricValue}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f' }}>{bilangan_kursus}</span>
            <span style={styles.metricTarget}> kursus</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
            Hanya kursus berstatus <strong>Diluluskan</strong> dikira dalam KPI
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '18px', color: '#1e3a5f' },
  badgeCapai: {
    backgroundColor: '#dcfce7', color: '#16a34a',
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  badgeBelum: {
    backgroundColor: '#fef3c7', color: '#d97706',
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  metricBox: {
    backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px',
    border: '1px solid #e2e8f0',
  },
  metricLabel: { fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' },
  metricValue: { marginBottom: '10px' },
  metricTarget: { fontSize: '14px', color: '#94a3b8' },
  progressBg: { backgroundColor: '#e2e8f0', borderRadius: '999px', height: '10px', overflow: 'hidden' },
  progressBar: { height: '10px', borderRadius: '999px', transition: 'width 0.5s ease' },
  persenText: { fontSize: '12px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' },
};
