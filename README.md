# hipertensi-ai-monitor
Aplikasi web yang membantu penderita hipertensi memantau tekanan darah harian, mengatur kepatuhan minum obat, serta mendapatkan insight kesehatan personal dari AI berdasarkan riwayat data mereka (tekanan darah, obat, dan gaya hidup).
# Pembagian Tugas Kelompok 9 — Sistem Pemantauan Hipertensi Berbasis AI

**Anggota Tim:**
1. **Haidar Dare Snowy** — Backend Core, Database & Modul Kepatuhan Obat
2. **Farida** — IoT Data Simulator, Clinical Rule-Engine & Time-Travel Seeder
3. **Oryza** — AI Engineer (Hybrid Recommendation & AI Health Assistant)
4. **Akmar** — Frontend Lead, UI/UX & Visualisasi Grafik Multi-Parameter

---

## Rincian Tugas & Checklist (Deliverables)

### 1. Haidar Dare Snowy (Backend Core & Manajemen Obat)
Fokus membangun fondasi server, struktur database dari ERD, autentikasi dasar, serta logika perhitungan kepatuhan minum obat.
- [ ] Inisialisasi struktur folder monorepo (`/client` dan `/server`) serta setup Express.js & koneksi database.
- [ ] Implementasi skema database berdasarkan ERD (`USER`, `MEDICATION`, `MED_SCHEDULE`, `MED_LOG`, `SIDE_EFFECT`, `ADHERENCE_SUMMARY`, dll).
- [ ] Membuat API Autentikasi dasar (Login/Register atau pemilihan profil pasien demo).
- [ ] Membuat REST API CRUD untuk jadwal obat (`MEDICATION` & `MED_SCHEDULE`) dan pencatatan efek samping (`SIDE_EFFECT`).
- [ ] Membuat endpoint log minum obat (`POST /api/meds/log`) lengkap dengan logika status otomatis (**Tepat Waktu** toleransi ±2 jam, **Terlambat**, **Terlewat**).
- [ ] Membuat fungsi kalkulasi persentase kepatuhan mingguan, bulanan, dan keseluruhan (`ADHERENCE_SUMMARY`).

### 2. Farida (IoT Simulator & Clinical Rule-Engine)
Fokus pada pembangkitan data sensor simulasi yang realistis, aturan medis berbasis *If-Else*, sistem peringatan bahaya, serta panel kontrol simulasi.
- [ ] Membuat endpoint `POST /api/iot/simulate` untuk membangkitkan data acak berkorelasi (`HEALTH_READING` & `BODY_CONDITION` — misal: stres tinggi & kurang tidur memicu tensi lebih tinggi).
- [ ] Membuat **Rule-Engine (If-Else)** untuk kategorisasi tekanan darah otomatis (Normal, Pra-hipertensi, Hipertensi Tk. 1, Hipertensi Tk. 2, Krisis Hipertensi).
- [ ] Membuat sistem pemicu otomatis ke tabel `ALERT` jika sistolik $\ge 180$ atau diastolik $\ge 120$ (Krisis Hipertensi).
- [ ] Membuat fitur **"Time-Travel Seeder"** (generate instan riwayat data 7 hari, 14 hari, dan 30 hari dengan pola tertentu untuk kebutuhan demo evolusi AI).
- [ ] Membuat komponen UI **Panel Simulator IoT** (tombol trigger data acak & tombol skenario demo) di Frontend.

### 3. Oryza (AI Engineer & AI Health Assistant)
Fokus menghubungkan seluruh data kesehatan dengan LLM (Generative AI) untuk menghasilkan rekomendasi yang makin matang seiring waktu dan fitur chatbot.
- [ ] Setup integrasi API LLM (Google Gemini API / Groq) di sisi backend.
- [ ] Membuat **Context Builder**: fungsi yang merangkum seluruh riwayat data user (tensi, tidur, stres, persentase kepatuhan obat, hingga catatan efek samping) menjadi prompt kontekstual.
- [ ] Membuat **Hybrid Recommendation Engine** (`POST /api/ai/recommend`) dengan 3 fase kematangan data (`< 7 hari` umum, `14–28 hari` tren, `> 30 hari` pola personal) dan menyimpannya ke tabel `RECOMMENDATION` beserta atribut `jumlah_data_dipakai`.
- [ ] Membuat endpoint **AI Health Assistant Chatbot** (`POST /api/ai/chat`) untuk tanya-jawab kondisi pasien, saran menu diet DASH, dan estimasi risiko komplikasi.
- [ ] Membuat halaman UI **AI Health Assistant (Chatbot)** beserta kartu tampilan hasil rekomendasi cerdas di Frontend.

### 4. Akmar (Frontend Lead & Visualisasi Data)
Fokus membangun kerangka antarmuka pengguna, dashboard utama, grafik korelasi multi-parameter, dan form manajemen obat.
- [ ] Inisialisasi proyek React (Vite) + Tailwind CSS dan setup routing navigasi antar halaman.
- [ ] Membuat halaman **Dashboard Utama** (ringkasan tensi terbaru, status kategori, banner peringatan *Alert* darurat, dan persentase kepatuhan).
- [ ] Membuat **Grafik Multi-Parameter** interaktif (menggunakan Recharts/Chart.js) yang membandingkan tren Tekanan Darah dengan Jam Tidur, Tingkat Stres, dan Kepatuhan Obat.
- [ ] Membuat halaman **Manajemen Obat & Efek Samping** (form tambah jadwal obat, tombol konfirmasi minum obat harian, dan form lapor efek samping).
- [ ] Integrasi seluruh tampilan UI dengan API dari tim backend serta memastikan tampilan responsif dan rapi untuk presentasi.

---

## Alur Kerja Git (Git Workflow) Kelompok

Agar kode tidak saling menimpa (*conflict*), seluruh anggota wajib mengikuti aturan branch berikut:
1. **`main`**: Branch utama khusus kode yang sudah stabil dan siap demo. **Dilarang `git push` langsung ke `main`.**
2. **`dev`**: Branch integrasi tempat menggabungkan hasil kerja seluruh anggota.
3. **Branch Fitur**: Setiap anggota bekerja di branch masing-masing sebelum membuat *Pull Request (PR)* ke `dev`:
   - `feat/backend-core` (Haidar)
   - `feat/iot-simulator` (Farida)
   - `feat/ai-assistant` (Oryza)
   - `feat/frontend-dashboard` (Akmar)
