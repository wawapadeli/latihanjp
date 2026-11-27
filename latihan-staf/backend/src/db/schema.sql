-- ==============================================
-- SCHEMA: Dashboard Latihan Staf
-- ==============================================

-- Jadual: users (staf & admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_pekerja VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    emel VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'staf' CHECK (role IN ('staf', 'admin')),
    tarikh_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadual: kursus (rekod latihan staf)
CREATE TABLE IF NOT EXISTS kursus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_kursus VARCHAR(200) NOT NULL,
    penganjur VARCHAR(150),
    tarikh_mula DATE NOT NULL,
    tarikh_tamat DATE NOT NULL,
    jumlah_jam NUMERIC(5,2) NOT NULL CHECK (jumlah_jam > 0),
    jumlah_hari INTEGER NOT NULL CHECK (jumlah_hari > 0),
    lokasi VARCHAR(150),
    catatan TEXT,
    dokumen_bukti VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diluluskan', 'ditolak')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadual: kpi_config (tetapan KPI per tahun)
CREATE TABLE IF NOT EXISTS kpi_config (
    tahun INTEGER PRIMARY KEY,
    min_jam NUMERIC(5,2) NOT NULL DEFAULT 40,
    min_hari INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Masukkan konfigurasi KPI default
INSERT INTO kpi_config (tahun, min_jam, min_hari)
VALUES (2026, 40, 5)
ON CONFLICT (tahun) DO NOTHING;

-- View: ringkasan KPI setiap staf per tahun
CREATE OR REPLACE VIEW v_kpi_summary AS
SELECT
    u.id AS user_id,
    u.no_pekerja,
    u.nama,
    u.jabatan,
    EXTRACT(YEAR FROM k.tarikh_mula)::INTEGER AS tahun,
    COALESCE(SUM(k.jumlah_jam) FILTER (WHERE k.status = 'diluluskan'), 0) AS jumlah_jam,
    COALESCE(SUM(k.jumlah_hari) FILTER (WHERE k.status = 'diluluskan'), 0) AS jumlah_hari,
    COUNT(k.id) FILTER (WHERE k.status = 'diluluskan') AS bilangan_kursus,
    kc.min_jam,
    kc.min_hari,
    CASE
        WHEN COALESCE(SUM(k.jumlah_jam) FILTER (WHERE k.status = 'diluluskan'), 0) >= kc.min_jam
         AND COALESCE(SUM(k.jumlah_hari) FILTER (WHERE k.status = 'diluluskan'), 0) >= kc.min_hari
        THEN 'capai'
        ELSE 'belum_capai'
    END AS status_kpi
FROM users u
CROSS JOIN kpi_config kc
LEFT JOIN kursus k ON u.id = k.user_id
    AND EXTRACT(YEAR FROM k.tarikh_mula)::INTEGER = kc.tahun
WHERE u.role = 'staf' AND u.is_active = TRUE
GROUP BY u.id, u.no_pekerja, u.nama, u.jabatan, kc.tahun, kc.min_jam, kc.min_hari;

-- Data awal: admin
INSERT INTO users (no_pekerja, nama, emel, password_hash, jabatan, role)
VALUES (
    'ADM001',
    'Admin HR',
    'admin@syarikat.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPZklABCDEF',
    'Sumber Manusia',
    'admin'
) ON CONFLICT (emel) DO NOTHING;
-- Nota: password di atas ialah hash untuk 'admin123' — TUKAR selepas setup!
