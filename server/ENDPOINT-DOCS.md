# 📚 Dokumentasi Endpoint API - Dashboard

## 🎯 Endpoint Baru untuk Dashboard

Endpoint ini dibuat untuk mendukung tampilan Dashboard frontend yang sudah diredesign.

---

## 1️⃣ GET /api/readings

**Deskripsi:** Mengambil data pembacaan tekanan darah (BP readings)

**URL:** `GET /api/readings?user_id=1&days=30`

**Query Parameters:**
- `user_id` (required): ID user
- `days` (optional): Jumlah hari ke belakang (default: 30)

**Response Success (200):**
```json
[
  {
    "reading_id": 1,
    "user_id": 1,
    "sistolik": 130,
    "diastolik": 85,
    "nadi": 72,
    "waktu": "2024-01-15T08:30:00.000Z",
    "kategori": "Normal",
    "sumber": "simulasi_iot"
  },
  {
    "reading_id": 2,
    "user_id": 1,
    "sistolik": 135,
    "diastolik": 88,
    "nadi": 75,
    "waktu": "2024-01-16T08:30:00.000Z",
    "kategori": "Prehipertensi",
    "sumber": "simulasi_iot"
  }
]
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Parameter user_id diperlukan"
}
```

**Database Table:** `HealthReading`

---

## 2️⃣ GET /api/conditions

**Deskripsi:** Mengambil data kondisi kesehatan (body conditions)

**URL:** `GET /api/conditions?user_id=1&days=30`

**Query Parameters:**
- `user_id` (required): ID user
- `days` (optional): Jumlah hari ke belakang (default: 30)

**Response Success (200):**
```json
[
  {
    "condition_id": 1,
    "user_id": 1,
    "tanggal": "2024-01-15T08:30:00.000Z",
    "berat_kg": 70.5,
    "tidur_jam": 7.5,
    "langkah": 8500,
    "stres_level": 3,
    "asupan_garam_level": 2,
    "gejala": null
  },
  {
    "condition_id": 2,
    "user_id": 1,
    "tanggal": "2024-01-16T09:00:00.000Z",
    "berat_kg": 70.3,
    "tidur_jam": 8.0,
    "langkah": 10000,
    "stres_level": 2,
    "asupan_garam_level": 1,
    "gejala": "Sedikit pusing"
  }
]
```

**Database Table:** `BodyCondition`

---

## 3️⃣ GET /api/alerts

**Deskripsi:** Mengambil alert/peringatan berdasarkan tekanan darah

**URL:** `GET /api/alerts?user_id=1&limit=10`

**Query Parameters:**
- `user_id` (required): ID user
- `limit` (optional): Jumlah alert terbaru (default: 10)

**Response Success (200):**
```json
[
  {
    "alert_id": 1,
    "user_id": 1,
    "reading_id": 15,
    "level": "waspada",
    "pesan": "Tekanan darah Anda berada di zona prehipertensi (135/88 mmHg)",
    "waktu": "2024-01-18T10:00:00.000Z",
    "reading": {
      "sistolik": 135,
      "diastolik": 88,
      "nadi": 75,
      "waktu": "2024-01-18T10:00:00.000Z"
    }
  },
  {
    "alert_id": 2,
    "user_id": 1,
    "reading_id": 20,
    "level": "krisis_hipertensi",
    "pesan": "BAHAYA! Tekanan darah sangat tinggi (180/110 mmHg). Segera konsultasi dokter!",
    "waktu": "2024-01-19T14:30:00.000Z",
    "reading": {
      "sistolik": 180,
      "diastolik": 110,
      "nadi": 95,
      "waktu": "2024-01-19T14:30:00.000Z"
    }
  }
]
```

**Alert Levels:**
- `waspada`: Prehipertensi atau Hipertensi Stage 1
- `krisis_hipertensi`: Hipertensi Stage 2 atau Krisis

**Database Table:** `Alert`

---

## 4️⃣ GET /api/readings/latest (BONUS)

**Deskripsi:** Mengambil pembacaan tekanan darah terbaru

**URL:** `GET /api/readings/latest?user_id=1`

**Query Parameters:**
- `user_id` (required): ID user

**Response Success (200):**
```json
{
  "reading_id": 25,
  "user_id": 1,
  "sistolik": 128,
  "diastolik": 82,
  "nadi": 70,
  "waktu": "2024-01-20T08:30:00.000Z",
  "kategori": "Normal"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Belum ada pembacaan untuk user ini"
}
```

---

## 5️⃣ GET /api/readings/stats (BONUS)

**Deskripsi:** Mengambil statistik pembacaan (rata-rata, min, max)

**URL:** `GET /api/readings/stats?user_id=1&days=30`

**Query Parameters:**
- `user_id` (required): ID user
- `days` (optional): Jumlah hari ke belakang (default: 30)

**Response Success (200):**
```json
{
  "total": 60,
  "sistolik": {
    "avg": 132,
    "min": 118,
    "max": 158
  },
  "diastolik": {
    "avg": 84,
    "min": 72,
    "max": 102
  },
  "nadi": {
    "avg": 74,
    "min": 62,
    "max": 92
  }
}
```

---

## 🧪 Testing Endpoint

### Dengan cURL:

```bash
# 1. Test readings
curl "http://localhost:5000/api/readings?user_id=1&days=30"

# 2. Test conditions
curl "http://localhost:5000/api/conditions?user_id=1&days=30"

# 3. Test alerts
curl "http://localhost:5000/api/alerts?user_id=1&limit=10"

# 4. Test latest reading
curl "http://localhost:5000/api/readings/latest?user_id=1"

# 5. Test stats
curl "http://localhost:5000/api/readings/stats?user_id=1&days=7"
```

### Dengan Postman:

1. Import collection atau buat request baru
2. Method: `GET`
3. URL: `http://localhost:5000/api/readings`
4. Params: 
   - `user_id`: `1`
   - `days`: `30`
5. Send!

---

## 🔗 Integration dengan Frontend

Frontend sudah dikonfigurasi untuk memanggil endpoint ini di file:
- `client/src/api/client.js`

Fungsi yang terkait:
```javascript
export const api = {
  readings: (days = 30) => req(`/readings?${q({ days })}`),
  conditions: (days = 30) => req(`/conditions?${q({ days })}`),
  alerts: () => req(`/alerts?${q()}`),
  // ... lainnya
};
```

---

## 🚀 Cara Menjalankan

1. **Start server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Generate data seeder (jika belum ada data):**
   ```bash
   curl -X POST "http://localhost:5000/api/iot/seed?user_id=1&days=30"
   ```

3. **Test endpoint:**
   ```bash
   curl "http://localhost:5000/api/readings?user_id=1&days=7"
   ```

4. **Start frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Buka browser:** `http://localhost:5173/dashboard`

---

## 🐛 Troubleshooting

### Error: "Parameter user_id diperlukan"
**Solusi:** Pastikan query parameter `user_id` ada di URL

### Error: "Cannot read properties of undefined"
**Solusi:** Pastikan Prisma Client sudah di-generate:
```bash
cd server
npx prisma generate
```

### Data kosong []
**Solusi:** Generate data seeder dulu:
```bash
curl -X POST "http://localhost:5000/api/iot/seed?user_id=1&days=30"
```

### CORS Error
**Solusi:** Pastikan CORS sudah enabled di `server/index.js`:
```javascript
app.use(cors());
```

---

## 📝 Notes untuk Tim

- **Haidar & Akmar**: Endpoint ini sudah siap pakai untuk Dashboard
- **Farida**: Endpoint `/api/iot/seed` dan `/api/iot/simulate` tetap bisa dipakai
- **Oryza**: AI Assistant endpoint terpisah di `/api/ai`
- **Frontend Team**: Environment variable `VITE_USE_MOCK=false` untuk pakai real API

---

**Created by:** Aqmar (Frontend Lead)  
**Date:** 2024  
**Status:** ✅ Ready to use
