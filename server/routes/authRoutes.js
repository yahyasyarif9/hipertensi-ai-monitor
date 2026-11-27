import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Login dengan email & password
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });
    }

    // Cek password (plain text untuk demo — bisa upgrade ke bcrypt nanti)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    // Jangan kirim password ke client
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      user: userSafe,
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Daftar akun baru
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, usia, tinggi_cm, riwayat_penyakit, gaya_hidup } = req.body;

    if (!nama || !email || !password || !usia || !tinggi_cm) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, password, usia, dan tinggi badan wajib diisi',
      });
    }

    // Cek email sudah dipakai
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const user = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: email.toLowerCase().trim(),
        password, // plain text untuk demo
        usia: parseInt(usia),
        tinggi_cm: parseFloat(tinggi_cm),
        riwayat_penyakit: riwayat_penyakit || null,
        gaya_hidup: gaya_hidup || null,
      },
    });

    const { password: _, ...userSafe } = user;

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: userSafe,
    });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me?user_id=1
// Ambil profil user yang sedang login
// ─────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) return res.status(400).json({ success: false, message: 'user_id diperlukan' });

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
