# 🎓 Dashboard Latihan Staf

Sistem pengurusan KPI latihan staf berbasiskan web. Setiap staf perlu memenuhi KPI minima **40 jam / 5 hari berkursus** setiap tahun.

---

## 📋 Ciri-Ciri

| Ciri | Staf | Admin |
|------|------|-------|
| Log masuk | ✅ | ✅ |
| Lihat KPI sendiri + progress bar | ✅ | - |
| Tambah rekod kursus | ✅ | - |
| Lihat history kursus | ✅ | - |
| Semak & luluskan/tolak kursus | - | ✅ |
| Dashboard KPI keseluruhan + carta | - | ✅ |
| Urus akaun staf | - | ✅ |
| Filter mengikut jabatan & tahun | ✅ | ✅ |

---

## 🛠️ Prasyarat

- **Node.js** v18+
- **PostgreSQL** v14+

---

## 🚀 Cara Setup

### 1. Database

```bash
# Buat database baru
createdb latihan_staf_db

# Jalankan schema
psql -d latihan_staf_db -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend

# Salin fail .env
cp .env.example .env
# Edit .env — isikan DB_PASSWORD dan tukar JWT_SECRET

# Pasang dependencies
npm install

# Jalankan server (port 5000)
npm run dev
```

### 3. Frontend

```bash
cd frontend

# Pasang dependencies
npm install

# Jalankan (port 3000)
npm start
```

---

## 🔑 Akaun Default

| Jenis | Emel | Kata Laluan |
|-------|------|-------------|
| Admin | admin@syarikat.com | admin123 |

> ⚠️ **PENTING:** Tukar kata laluan admin selepas log masuk pertama!

Untuk daftar staf baru, log masuk sebagai Admin → **Urus Staf** → **Daftar Staf Baru**.

---

## 📡 API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/login` | Log masuk |
| POST | `/api/auth/daftar` | Daftar staf (admin) |
| GET | `/api/kpi/saya` | KPI staf semasa |
| GET | `/api/kpi/semua` | KPI semua staf (admin) |
| GET | `/api/kpi/ringkasan` | Ringkasan organisasi (admin) |
| GET | `/api/kursus` | Senarai kursus |
| POST | `/api/kursus` | Tambah kursus |
| PATCH | `/api/kursus/:id/status` | Lulus/tolak kursus (admin) |
| GET | `/api/staf` | Senarai staf (admin) |
| PATCH | `/api/staf/:id/status` | Aktif/nyahaktif staf (admin) |

---

## 🗂️ Struktur Projek

```
latihan-staf/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js          # Sambungan PostgreSQL
│   │   │   └── schema.sql       # Schema & migration
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js          # Login & daftar
│   │   │   ├── kursus.js        # CRUD kursus
│   │   │   ├── kpi.js           # KPI queries
│   │   │   └── staf.js          # Urus staf
│   │   └── index.js             # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # HTTP client + interceptors
    │   ├── components/
    │   │   ├── Navbar.js        # Navigation bar
    │   │   └── KpiProgressCard.js  # Kad progress KPI
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state management
    │   ├── pages/
    │   │   ├── LoginPage.js     # Halaman log masuk
    │   │   ├── DashboardStaf.js # Dashboard staf
    │   │   ├── TambahKursus.js  # Form tambah kursus
    │   │   ├── DashboardAdmin.js    # Dashboard admin + carta
    │   │   ├── SemakKursusAdmin.js  # Semak & lulus kursus
    │   │   └── UrusStafAdmin.js     # Urus akaun staf
    │   ├── App.js               # Routes & layout
    │   └── index.js             # Entry point
    └── package.json
```
