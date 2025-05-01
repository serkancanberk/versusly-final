import express from 'express';
import axios from 'axios';
import Clash from '../models/Clash.js'; // Clash modelini doğru bir şekilde import ediyoruz
const router = express.Router();

// Tüm Clash'leri getirme (tag filtreli)
router.get('/', async (req, res) => {
  try {
    const sortField = (req.query.sort || '-createdAt').replace('-', '');
    const sortOrder = (req.query.sort || '-createdAt').startsWith('-') ? -1 : 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tag = req.query.tag;
    const filter = tag ? { tags: { $in: [tag] } } : {};

    const clashes = await Clash.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit);

    res.json(clashes);
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

// Yeni bir argüman ekleme
router.post('/:id/argument', async (req, res) => {
  const { text, author } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Argument text is required" });
  }
  try {
    const clash = await Clash.findById(req.params.id);
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }
    // Argümanlar dizisi yoksa başlat
    if (!Array.isArray(clash.arguments)) {
      clash.arguments = [];
    }
    clash.arguments.push({
      text,
      author: author || null,
      created_at: new Date()
    });
    await clash.save();
    res.json(clash.arguments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reaksiyon ekleme
router.post('/:id/react', async (req, res) => {
  const { reactionType } = req.body;
  const allowedReactions = ["nailed_it", "fair_point", "neutral", "really", "try_again"];
  if (!allowedReactions.includes(reactionType)) {
    return res.status(400).json({ message: "Invalid reactionType" });
  }
  try {
    const clash = await Clash.findById(req.params.id);
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }
    // Reactions objesi yoksa başlat
    if (!clash.reactions) {
      clash.reactions = {};
      allowedReactions.forEach(type => {
        clash.reactions[type] = 0;
      });
    }
    clash.reactions[reactionType] = (clash.reactions[reactionType] || 0) + 1;
    await clash.save();
    res.json(clash.reactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/suggest-tags', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required for tag suggestion." });
  }

  try {
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates 3-5 short, fun and relevant topic tags based on a title for a debate or versus content. Return only an array of tags."
          },
          {
            role: "user",
            content: `Suggest topic tags for the debate title: "${title}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const tagResponse = openaiRes.data.choices[0].message.content;
    const tags = JSON.parse(tagResponse);

    res.json({ tags });
  } catch (err) {
    console.error("OpenAI tag suggestion error:", err.message);
    res.status(500).json({ message: "Failed to generate tags." });
  }
});

export default router; // clashRoutes'u dışarıya aktarıyoruz
