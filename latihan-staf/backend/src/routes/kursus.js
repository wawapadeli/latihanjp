const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/kursus — senarai kursus staf semasa (atau semua jika admin)
router.get('/', authMiddleware, async (req, res) => {
  const { tahun } = req.query;
  const targetTahun = tahun || new Date().getFullYear();

  try {
    let query, params;

    if (req.user.role === 'admin') {
      query = `
        SELECT k.*, u.nama AS nama_staf, u.no_pekerja, u.jabatan
        FROM kursus k
        JOIN users u ON k.user_id = u.id
        WHERE EXTRACT(YEAR FROM k.tarikh_mula) = $1
        ORDER BY k.tarikh_mula DESC
      `;
      params = [targetTahun];
    } else {
      query = `
        SELECT * FROM kursus
        WHERE user_id = $1 AND EXTRACT(YEAR FROM tarikh_mula) = $2
        ORDER BY tarikh_mula DESC
      `;
      params = [req.user.id, targetTahun];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// POST /api/kursus — tambah rekod kursus baru
router.post('/', authMiddleware, async (req, res) => {
  const {
    nama_kursus,
    penganjur,
    tarikh_mula,
    tarikh_tamat,
    jumlah_jam,
    jumlah_hari,
    lokasi,
    catatan,
  } = req.body;

  if (!nama_kursus || !tarikh_mula || !tarikh_tamat || !jumlah_jam || !jumlah_hari) {
    return res.status(400).json({ mesej: 'Medan wajib: nama_kursus, tarikh_mula, tarikh_tamat, jumlah_jam, jumlah_hari.' });
  }

  if (new Date(tarikh_tamat) < new Date(tarikh_mula)) {
    return res.status(400).json({ mesej: 'Tarikh tamat tidak boleh lebih awal dari tarikh mula.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO kursus
        (user_id, nama_kursus, penganjur, tarikh_mula, tarikh_tamat, jumlah_jam, jumlah_hari, lokasi, catatan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.id,
        nama_kursus,
        penganjur || null,
        tarikh_mula,
        tarikh_tamat,
        jumlah_jam,
        jumlah_hari,
        lokasi || null,
        catatan || null,
      ]
    );

    res.status(201).json({ mesej: 'Rekod kursus berjaya ditambah.', kursus: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// PATCH /api/kursus/:id/status — admin luluskan atau tolak kursus
router.patch('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ mesej: 'Akses terhad kepada Admin.' });
  }

  const { status } = req.body;
  if (!['diluluskan', 'ditolak', 'menunggu'].includes(status)) {
    return res.status(400).json({ mesej: 'Status tidak sah.' });
  }

  try {
    const result = await pool.query(
      `UPDATE kursus SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mesej: 'Rekod kursus tidak dijumpai.' });
    }

    res.json({ mesej: `Kursus ${status}.`, kursus: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// DELETE /api/kursus/:id — staf hapus rekod sendiri (hanya jika status 'menunggu')
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const semak = await pool.query(
      'SELECT * FROM kursus WHERE id = $1',
      [req.params.id]
    );

    if (semak.rows.length === 0) {
      return res.status(404).json({ mesej: 'Rekod tidak dijumpai.' });
    }

    const rekod = semak.rows[0];

    if (req.user.role !== 'admin' && rekod.user_id !== req.user.id) {
      return res.status(403).json({ mesej: 'Anda tidak dibenarkan memadam rekod ini.' });
    }

    if (req.user.role !== 'admin' && rekod.status !== 'menunggu') {
      return res.status(400).json({ mesej: 'Hanya rekod berstatus "menunggu" boleh dipadam.' });
    }

    await pool.query('DELETE FROM kursus WHERE id = $1', [req.params.id]);
    res.json({ mesej: 'Rekod berjaya dipadam.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

module.exports = router;
