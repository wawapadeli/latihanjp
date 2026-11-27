import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function UrusStafAdmin() {
  const [stafList, setStafList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ no_pekerja: '', nama: '', emel: '', password: '', jabatan: '', tarikh_masuk: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaf();
  }, []);

  const fetchStaf = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staf');
      setStafList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDaftar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/daftar', form);
      toast.success(`Staf ${form.nama} berjaya didaftarkan.`);
      setForm({ no_pekerja: '', nama: '', emel: '', password: '', jabatan: '', tarikh_masuk: '' });
      setShowForm(false);
      fetchStaf();
    } catch (err) {
      toast.error(err.response?.data?.mesej || 'Gagal mendaftar staf.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAktif = async (id, semasa) => {
    try {
      await api.patch(`/staf/${id}/status`, { is_active: !semasa });
      toast.success(`Akaun staf ${!semasa ? 'diaktifkan' : 'dinyahaktifkan'}.`);
      fetchStaf();
    } catch (err) {
      toast.error('Gagal kemaskini status.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Urus Staf</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '✕ Tutup' : '+ Daftar Staf Baru'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Daftar Staf Baru</h3>
          <form onSubmit={handleDaftar}>
            <div style={styles.grid2}>
              <Field label="No. Pekerja *" name="no_pekerja" value={form.no_pekerja} onChange={handleChange} required placeholder="EMP001" />
              <Field label="Nama Penuh *" name="nama" value={form.nama} onChange={handleChange} required placeholder="Ahmad Bin Ali" />
              <Field label="Emel *" name="emel" type="email" value={form.emel} onChange={handleChange} required placeholder="ahmad@syarikat.com" />
              <Field label="Kata Laluan Awal *" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 aksara" />
              <Field label="Jabatan *" name="jabatan" value={form.jabatan} onChange={handleChange} required placeholder="Teknologi Maklumat" />
              <Field label="Tarikh Masuk" name="tarikh_masuk" type="date" value={form.tarikh_masuk} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Batal</button>
              <button type="submit" disabled={submitting} style={styles.submitBtn}>{submitting ? 'Mendaftar...' : '✅ Daftar Staf'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Memuatkan...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>No. Pekerja</th>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Emel</th>
                <th style={styles.th}>Jabatan</th>
                <th style={styles.th}>Tarikh Masuk</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {stafList.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.no_pekerja}</td>
                  <td style={styles.td}>{s.nama}</td>
                  <td style={styles.td}>{s.emel}</td>
                  <td style={styles.td}>{s.jabatan}</td>
                  <td style={styles.td}>{new Date(s.tarikh_masuk).toLocaleDateString('ms-MY')}</td>
                  <td style={styles.td}>
                    {s.is_active
                      ? <span style={styles.badgeAktif}>Aktif</span>
                      : <span style={styles.badgeTidakAktif}>Tidak Aktif</span>
                    }
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => toggleAktif(s.id, s.is_active)} style={s.is_active ? styles.btnNyahaktif : styles.btnAktif}>
                      {s.is_active ? 'Nyahaktif' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stafList.length === 0 && <div style={styles.empty}>Tiada staf berdaftar lagi.</div>}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }} />
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', color: '#1e3a5f' },
  addBtn: { padding: '9px 18px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  formCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  cancelBtn: { padding: '9px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '9px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '48px', color: '#64748b' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f1f5f9' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#374151' },
  badgeAktif: { backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  badgeTidakAktif: { backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  btnAktif: { padding: '5px 12px', backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnNyahaktif: { padding: '5px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
};
