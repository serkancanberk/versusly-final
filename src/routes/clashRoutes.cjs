const express = require('express');
const Clash = require('../models/Clash.cjs'); // Clash modelini doğru bir şekilde import ediyoruz
const router = express.Router();

// Tüm Clash'leri getirme
router.get('/', async (req, res) => {
  try {
    const clashes = await Clash.find(); // Veritabanından tüm clash'leri alıyoruz
    res.json(clashes); // Clash'leri JSON formatında döndürüyoruz
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tek bir Clash'i getirme
router.get('/:id', async (req, res) => {
  try {
    const clash = await Clash.findById(req.params.id); // Clash'i ID'ye göre arıyoruz
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }
    res.json(clash); // Bulunan clash'i JSON formatında döndürüyoruz
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Yeni Clash oluşturma
router.post('/', async (req, res) => {
  const { vs_title, vs_statement, vs_argument, creator, duration } = req.body;

  // Validation: duration (süre) geçerli bir sayı olmalı
  if (!duration || isNaN(duration) || duration <= 0) {
    return res.status(400).json({ message: "Invalid duration" });
  }

  const clash = new Clash({
    vs_title,
    vs_statement,
    vs_argument,
    creator: creator || null, // Eğer creator belirtilmemişse null olarak bırakıyoruz
    created_at: new Date(),
    updated_at: new Date(),
    votes: [],
    status: "active",
    expires_at: new Date(Date.now() + duration * 60 * 60 * 1000), // Süreyi saat olarak alıyoruz
    duration,
  });

  try {
    const newClash = await clash.save(); // Clash'i veritabanına kaydediyoruz
    res.status(201).json(newClash); // Yeni Clash'i JSON formatında döndürüyoruz
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clash güncelleme
router.put('/:id', async (req, res) => {
  try {
    const clash = await Clash.findById(req.params.id);

    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    clash.vs_title = req.body.vs_title || clash.vs_title;
    clash.vs_statement = req.body.vs_statement || clash.vs_statement;
    clash.vs_argument = req.body.vs_argument || clash.vs_argument;
    clash.updated_at = new Date();

    const updatedClash = await clash.save();
    res.json(updatedClash); // Güncellenmiş Clash'i döndürüyoruz
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clash silme
router.delete('/:id', async (req, res) => {
  try {
    const clash = await Clash.findById(req.params.id);

    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    await clash.remove(); // Clash'i siliyoruz
    res.json({ message: 'Clash deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; // clashRoutes'u dışarıya aktarıyoruz
