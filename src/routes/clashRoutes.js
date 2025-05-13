import express from 'express';
import axios from 'axios';
import Clash from '../models/Clash.js'; // Clash modelini doğru bir şekilde import ediyoruz
import {
  createClash,
  getClashes,
  getClashById,
  getClashesByTag
} from '../controllers/clashController.js';
import authenticateUser from "../middleware/authMiddleware.js";
import getStatusLabel from '../utils/statusLabel.js';

// NOTE: Ensure the Clash model includes a properly defined `tags` field with default value and validation.
// Example (in Clash.js):
// tags: {
//   type: [String],
//   default: [],
//   validate: {
//     validator: tags => tags.every(tag => typeof tag === 'string' && tag.trim() !== ''),
//     message: 'Each tag must be a non-empty string.'
//   },
//   index: true
// }

const router = express.Router();

// Tüm Clash'leri getirme (controller)
router.get('/', getClashes);

// Get top tags
router.get('/top-tags', async (req, res) => {
  console.log("GET /api/clashes/top-tags called");
  console.log("Top tags route hit"); // Initial route hit log
  try {
    console.log("Starting top tags aggregation...");
    
    // First, let's check if we have any documents with tags
    const docCount = await Clash.countDocuments({ tags: { $exists: true, $ne: [] } });
    console.log("Documents with tags:", docCount);

    const topTags = await Clash.aggregate([
      { 
        $match: { 
          tags: { 
            $exists: true, 
            $ne: [], 
            $type: "array" 
          } 
        } 
      },
      { $unwind: "$tags" },
      { 
        $group: { 
          _id: "$tags", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { 
        $project: { 
          tag: "$_id", 
          count: 1, 
          _id: 0 
        } 
      }
    ]);

    console.log("Aggregation result:", topTags);

    if (!Array.isArray(topTags)) {
      console.error("topTags is not an array:", topTags);
      return res.status(500).json({ 
        message: "Invalid topTags format",
        error: "Aggregation result is not an array"
      });
    }

    // Filter in JS to ensure valid tag objects
    const filteredTags = topTags.filter(tag => 
      tag && 
      tag.tag && 
      typeof tag.tag === "string" && 
      typeof tag.count === "number"
    );

    console.log("Filtered tags:", filteredTags);
    res.json(filteredTags);
  } catch (err) {
    console.error("Top Tags Aggregation Error:", err.message);
    console.error("Stack Trace:", err.stack);
    res.status(500).json({ 
      message: "Error in top-tags route", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Search clashes
router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.json([]);
    }

    const searchRegex = new RegExp(searchQuery.trim(), 'i'); // Case-insensitive partial matching
    const clashes = await Clash.find({
      $or: [
        { vs_title: searchRegex },
        { vs_statement: searchRegex }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    // .populate("creator", "name picture email");

    res.json(clashes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tek bir Clash'i getirme (controller)
router.get('/:id', getClashById);

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
router.post('/:id/Clash_arguments', authenticateUser, async (req, res) => {
  try {
    const { text, side } = req.body;
    const clash = await Clash.findById(req.params.id);
    
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    const user = req.user._id;
    clash.Clash_arguments.push({ user, text, side, createdAt: new Date() });
    await clash.save();

    res.status(200).json({ message: "Argument added", Clash_arguments: clash.Clash_arguments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reaksiyon ekleme
router.post('/:id/react', authenticateUser, async (req, res) => {
  const { reactionType } = req.body;
  const allowedReactions = ["Nailed It", "Fair Point", "Can't Decide", "Really?", "Try Again"];
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

// Get clashes by tag
router.get('/tag/:tagName', getClashesByTag);

export default router; // clashRoutes'u dışarıya aktarıyoruz
