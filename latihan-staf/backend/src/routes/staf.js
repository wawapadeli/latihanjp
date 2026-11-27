const express = require('express');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/staf — senarai semua staf (admin sahaja)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, no_pekerja, nama, emel, jabatan, tarikh_masuk, is_active, created_at
       FROM users WHERE role = 'staf' ORDER BY nama ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// GET /api/staf/profil — profil staf semasa
router.get('/profil', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, no_pekerja, nama, emel, jabatan, tarikh_masuk FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mesej: 'Pengguna tidak dijumpai.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// PATCH /api/staf/tukar-kata-laluan
router.patch('/tukar-kata-laluan', authMiddleware, async (req, res) => {
  const { kata_laluan_lama, kata_laluan_baru } = req.body;

  if (!kata_laluan_lama || !kata_laluan_baru) {
    return res.status(400).json({ mesej: 'Kata laluan lama dan baru diperlukan.' });
  }

  if (kata_laluan_baru.length < 6) {
    return res.status(400).json({ mesej: 'Kata laluan baru mestilah sekurang-kurangnya 6 aksara.' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const sahih = await bcrypt.compare(kata_laluan_lama, result.rows[0].password_hash);

    if (!sahih) {
      return res.status(401).json({ mesej: 'Kata laluan lama tidak betul.' });
    }

    const hash = await bcrypt.hash(kata_laluan_baru, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ mesej: 'Kata laluan berjaya ditukar.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// PATCH /api/staf/:id/status — admin aktif/nyahaktif staf
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 AND role = $3 RETURNING id, nama, is_active',
      [is_active, req.params.id, 'staf']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mesej: 'Staf tidak dijumpai.' });
    }

    res.json({ mesej: `Akaun staf ${is_active ? 'diaktifkan' : 'dinyahaktifkan'}.`, staf: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

module.exports = router;
