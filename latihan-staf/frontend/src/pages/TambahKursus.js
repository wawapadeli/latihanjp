import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function TambahKursus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_kursus: '',
    penganjur: '',
    tarikh_mula: '',
    tarikh_tamat: '',
    jumlah_jam: '',
    jumlah_hari: '',
    lokasi: '',
    catatan: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-kira bilangan hari apabila kedua-dua tarikh diisi
      if ((name === 'tarikh_mula' || name === 'tarikh_tamat') && updated.tarikh_mula && updated.tarikh_tamat) {
        const mula = new Date(updated.tarikh_mula);
        const tamat = new Date(updated.tarikh_tamat);
        const diff = Math.round((tamat - mula) / (1000 * 60 * 60 * 24)) + 1;
        if (diff > 0) updated.jumlah_hari = diff;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.jumlah_jam) <= 0) {
      toast.error('Jumlah jam mesti lebih dari 0.');
      return;
    }
    if (new Date(form.tarikh_tamat) < new Date(form.tarikh_mula)) {
      toast.error('Tarikh tamat tidak boleh lebih awal dari tarikh mula.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/kursus', {
        ...form,
        jumlah_jam: parseFloat(form.jumlah_jam),
        jumlah_hari: parseInt(form.jumlah_hari),
      });
      toast.success('Rekod kursus berjaya dihantar untuk kelulusan!');
      navigate('/kursus');
    } catch (err) {
      toast.error(err.response?.data?.mesej || 'Gagal menyimpan rekod.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>➕ Tambah Rekod Kursus</h1>
        <p style={styles.info}>
          Rekod kursus akan dihantar kepada Admin HR untuk kelulusan sebelum dikira dalam KPI anda.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Nama Kursus <span style={{ color: 'red' }}>*</span></label>
              <input name="nama_kursus" value={form.nama_kursus} onChange={handleChange} required style={styles.input} placeholder="cth: Kursus Kepimpinan Strategik" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Penganjur</label>
              <input name="penganjur" value={form.penganjur} onChange={handleChange} style={styles.input} placeholder="cth: INTAN, MAMPU" />
            </div>
          </div>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Tarikh Mula <span style={{ color: 'red' }}>*</span></label>
              <input type="date" name="tarikh_mula" value={form.tarikh_mula} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tarikh Tamat <span style={{ color: 'red' }}>*</span></label>
              <input type="date" name="tarikh_tamat" value={form.tarikh_tamat} onChange={handleChange} required style={styles.input} />
            </div>
          </div>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Jumlah Jam <span style={{ color: 'red' }}>*</span></label>
              <input type="number" name="jumlah_jam" value={form.jumlah_jam} onChange={handleChange} required min="0.5" step="0.5" style={styles.input} placeholder="cth: 8" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Jumlah Hari <span style={{ color: 'red' }}>*</span></label>
              <input type="number" name="jumlah_hari" value={form.jumlah_hari} onChange={handleChange} required min="1" style={styles.input} placeholder="Auto-dikira" />
              <small style={styles.hint}>Auto-dikira berdasarkan tarikh. Boleh ubah secara manual.</small>
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Lokasi</label>
            <input name="lokasi" value={form.lokasi} onChange={handleChange} style={styles.input} placeholder="cth: Kuala Lumpur / Online" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Catatan</label>
            <textarea name="catatan" value={form.catatan} onChange={handleChange} style={{ ...styles.input, height: '80px', resize: 'vertical' }} placeholder="Maklumat tambahan..." />
          </div>
          <div style={styles.actions}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>Batal</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Menghantar...' : '📤 Hantar untuk Kelulusan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px 20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { margin: '0 0 8px', fontSize: '20px', color: '#1e3a5f' },
  info: { backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  hint: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px 24px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};
