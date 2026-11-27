const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/kpi/saya — KPI staf semasa
router.get('/saya', authMiddleware, async (req, res) => {
  const { tahun } = req.query;
  const targetTahun = tahun || new Date().getFullYear();

  try {
    const result = await pool.query(
      'SELECT * FROM v_kpi_summary WHERE user_id = $1 AND tahun = $2',
      [req.user.id, targetTahun]
    );

    // Jika tiada rekod, kembalikan nilai 0
    if (result.rows.length === 0) {
      const kpiConfig = await pool.query('SELECT * FROM kpi_config WHERE tahun = $1', [targetTahun]);
      const config = kpiConfig.rows[0] || { min_jam: 40, min_hari: 5 };

      return res.json({
        user_id: req.user.id,
        no_pekerja: req.user.no_pekerja,
        nama: req.user.nama,
        jabatan: req.user.jabatan,
        tahun: parseInt(targetTahun),
        jumlah_jam: 0,
        jumlah_hari: 0,
        bilangan_kursus: 0,
        min_jam: config.min_jam,
        min_hari: config.min_hari,
        status_kpi: 'belum_capai',
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// GET /api/kpi/semua — semua staf (admin sahaja)
router.get('/semua', authMiddleware, adminOnly, async (req, res) => {
  const { tahun, jabatan } = req.query;
  const targetTahun = tahun || new Date().getFullYear();

  try {
    let query = 'SELECT * FROM v_kpi_summary WHERE tahun = $1';
    const params = [targetTahun];

    if (jabatan) {
      query += ' AND jabatan = $2';
      params.push(jabatan);
    }

    query += ' ORDER BY nama ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// GET /api/kpi/ringkasan — ringkasan organisasi (admin sahaja)
router.get('/ringkasan', authMiddleware, adminOnly, async (req, res) => {
  const { tahun } = req.query;
  const targetTahun = tahun || new Date().getFullYear();

  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS jumlah_staf,
        COUNT(*) FILTER (WHERE status_kpi = 'capai') AS staf_capai_kpi,
        COUNT(*) FILTER (WHERE status_kpi = 'belum_capai') AS staf_belum_capai,
        ROUND(AVG(jumlah_jam), 2) AS purata_jam,
        ROUND(AVG(jumlah_hari), 2) AS purata_hari,
        ROUND(
          COUNT(*) FILTER (WHERE status_kpi = 'capai') * 100.0 / NULLIF(COUNT(*), 0),
          1
        ) AS peratus_capai
      FROM v_kpi_summary
      WHERE tahun = $1
    `, [targetTahun]);

    // Pecahan mengikut jabatan
    const jabatan = await pool.query(`
      SELECT
        jabatan,
        COUNT(*) AS jumlah,
        COUNT(*) FILTER (WHERE status_kpi = 'capai') AS capai
      FROM v_kpi_summary
      WHERE tahun = $1
      GROUP BY jabatan
      ORDER BY jabatan
    `, [targetTahun]);

    res.json({
      tahun: parseInt(targetTahun),
      keseluruhan: result.rows[0],
      mengikut_jabatan: jabatan.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

// GET /api/kpi/jabatan — senarai jabatan unik
router.get('/jabatan', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT jabatan FROM users WHERE role = $1 AND is_active = TRUE ORDER BY jabatan',
      ['staf']
    );
    res.json(result.rows.map((r) => r.jabatan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesej: 'Ralat pelayan.' });
  }
});

module.exports = router;
