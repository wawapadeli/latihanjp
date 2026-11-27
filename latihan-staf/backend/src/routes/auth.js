const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { emel, password } = req.body;

  if (!emel || !password) {
    return res.status(400).json({ mesej: 'Emel dan kata laluan diperlukan.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE emel = $1 AND is_active = TRUE',
      [emel.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mesej: 'Emel atau kata laluan tidak betul.' });
    }

    const user = result.rows[0];
    const passwordSah = await bcrypt.compare(password, user.password_hash);

    if (!passwordSah) {
      return res.status(401).json({ mesej: 'Emel atau kata laluan tidak betul.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        no_pekerja: user.no_pekerja,
        nama: user.nama,
        emel: user.emel,
        jabatan: user.jabatan,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        no_pekerja: user.no_pekerja,
        nama: user.nama,
        emel: user.emel,
        jabatan: user.jabatan,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// POST /api/auth/daftar (admin sahaja boleh daftarkan staf baru)
router.post('/daftar', async (req, res) => {
  const { no_pekerja, nama, emel, password, jabatan, tarikh_masuk } = req.body;

  if (!no_pekerja || !nama || !emel || !password || !jabatan) {
    return res.status(400).json({ mesej: 'Semua medan wajib diisi.' });
  }

  try {
    const semak = await pool.query('SELECT id FROM users WHERE emel = $1 OR no_pekerja = $2', [
      emel.toLowerCase(),
      no_pekerja,
    ]);

    if (semak.rows.length > 0) {
      return res.status(409).json({ mesej: 'Emel atau no. pekerja sudah wujud.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (no_pekerja, nama, emel, password_hash, jabatan, tarikh_masuk)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, no_pekerja, nama, emel, jabatan, role`,
      [no_pekerja, nama, emel.toLowerCase(), hash, jabatan, tarikh_masuk || new Date()]
    );

    res.status(201).json({ mesej: 'Akaun staf berjaya didaftarkan.', staf: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

module.exports = router;
