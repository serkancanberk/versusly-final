import express from 'express';
import axios from 'axios';
import Clash from '../models/Clash.js'; // Clash modelini doğru bir şekilde import ediyoruz
import { createClash } from '../controllers/clashController.js'; // <-- ADD THIS LINE
import authenticateUser from "../middleware/authMiddleware.js";
import getStatusLabel from '../utils/statusLabel.js';

const router = express.Router();

// Tüm Clash'leri getirme (tag filtreli)
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const tag = req.query.tag;
    // Add sortField from query, with default fallback
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder;

    let filter = tag ? { tags: { $in: [tag] } } : {};

    const now = new Date();

    console.log("Query parameters:", { offset, tag, sortField });

    // Build sort object for Mongo
    let mongoSort = {};
    if (sortField) {
      mongoSort[sortField] = -1;
    }

    let clashes = await Clash.find(filter)
      .sort(mongoSort)
      .populate("creator", "name picture email");

    clashes = clashes.map(clash => {
      clash = clash.toObject();
      clash.statusLabel = getStatusLabel(clash);
      return clash;
    });

    if (sortOrder === 'custom') {
      const hotClashes = clashes
        .filter(c => c.statusLabel === 'hot')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const newClashes = clashes
        .filter(c => c.statusLabel === 'new')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const finishedClashes = clashes
        .filter(c => c.statusLabel === 'finished')
        .sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at));

      clashes = [...hotClashes, ...newClashes, ...finishedClashes];
    }

    console.log("Clashes fetched from DB:", clashes);
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
router.post('/', authenticateUser, createClash);


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

// Yeni bir argüman ekleme (güncel versiyon)
router.post('/:id/arguments', authenticateUser, async (req, res) => {
  const { text, side } = req.body;
  const user = req.user._id;

  if (!text || !side) {
    return res.status(400).json({ message: "Both text and side are required" });
  }

  try {
    const clash = await Clash.findById(req.params.id);
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    clash.arguments.push({ user, text, side, createdAt: new Date() });
    await clash.save();

    res.status(200).json({ message: "Argument added", arguments: clash.arguments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reaksiyon ekleme
router.post('/:id/react', authenticateUser, async (req, res) => {
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

router.post('/evaluate', authenticateUser, async (req, res) => {
  const OPENAI_API_URL = process.env.OPENAI_API_URL;
  if (!OPENAI_API_URL) {
    return res.status(500).json({ message: "OPENAI_API_URL is not defined in .env" });
  }
  try {
    const response = await axios.post(OPENAI_API_URL, req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; // clashRoutes'u dışarıya aktarıyoruz
