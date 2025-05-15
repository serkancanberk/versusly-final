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
import mongoose from 'mongoose';

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
    .populate("creator", "name picture email");

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

    // Get the appropriate label from sideLabels
    let label = "Unknown";
    if (side === "for") label = clash.sideLabels?.sideA?.label || "For";
    else if (side === "against") label = clash.sideLabels?.sideB?.label || "Against";
    else if (side === "neutral") label = clash.sideLabels?.neutral?.label || "Neutral";

    const user = req.user._id;
    const newArgument = {
      user,
      text,
      side: {
        value: side,
        label: label
      },
      createdAt: new Date()
    };

    clash.Clash_arguments.push(newArgument);
    await clash.save();

    // Retrieve the last added argument and populate its user field
    const latestArgument = clash.Clash_arguments[clash.Clash_arguments.length - 1];
    const populatedArgument = await Clash.findOne(
      { _id: clash._id, "Clash_arguments._id": latestArgument._id },
      { "Clash_arguments.$": 1 }
    ).populate("Clash_arguments.user", "name picture");

    if (!populatedArgument || !populatedArgument.Clash_arguments?.[0]) {
      return res.status(500).json({ message: "Failed to retrieve populated argument" });
    }

    res.status(201).json({
      message: "Argument added",
      newArgument: populatedArgument.Clash_arguments[0]
    });
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

// Add a new entry to a clash
router.post('/:id/entries', authenticateUser, async (req, res) => {
  try {
    const { text, side } = req.body;
    const clashId = req.params.id;

    console.log('Received entry submission:', { text, side, clashId });

    // Input validation
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required and cannot be empty" });
    }

    // Validate side value
    const validSides = ['for', 'against', 'neutral'];
    if (!validSides.includes(side)) {
      console.error('Invalid side value received:', side);
      return res.status(400).json({ 
        message: "Invalid side value. Must be one of: for, against, or neutral",
        receivedSide: side
      });
    }

    const clash = await Clash.findById(clashId);
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    // Create new entry
    let label;
    if (side === 'for') {
      label = clash.sideLabels?.sideA?.label;
    } else if (side === 'against') {
      label = clash.sideLabels?.sideB?.label;
    } else if (side === 'neutral') {
      label = clash.sideLabels?.neutral?.label;
    }

    const newEntry = {
      _id: new mongoose.Types.ObjectId(),
      text: text.trim(),
      side: {
        value: side,
        label: label || side
      },
      user: req.user._id,
      createdAt: new Date()
    };

    console.log('Creating new entry:', newEntry);

    // Add to Clash_arguments array
    clash.Clash_arguments.push(newEntry);

    // Check if user has already voted
    const hasVoted = clash.votes.some(vote => vote.userId.toString() === req.user._id.toString());
    
    // If user hasn't voted yet, add their vote
    if (!hasVoted) {
      clash.votes.push({
        userId: req.user._id,
        side: side,
        timestamp: new Date()
      });
    }

    await clash.save();
    // Populate the newly added argument's user info and label
    await clash.populate({
      path: 'Clash_arguments.user',
      select: 'name picture'
    });
    const updatedArgument = clash.Clash_arguments.find(arg => arg._id.equals(newEntry._id));
    if (updatedArgument && typeof updatedArgument.side === 'object') {
      const sideValue = updatedArgument.side.value;
      let label = "Unknown";
      if (sideValue === 'for') label = clash.sideLabels?.sideA?.label || "For";
      else if (sideValue === 'against') label = clash.sideLabels?.sideB?.label || "Against";
      else if (sideValue === 'neutral') label = clash.sideLabels?.neutral?.label || "Neutral";
      updatedArgument.side.label = label;
    }
    res.status(201).json({ 
      message: "Entry added successfully",
      newArgument: updatedArgument,
      voteRecorded: !hasVoted,
      vote: !hasVoted ? {
        side: side,
        timestamp: new Date()
      } : null
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    // Send more detailed error information in development
    const errorResponse = {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    };
    res.status(500).json(errorResponse);
  }
});

export default router; // clashRoutes'u dışarıya aktarıyoruz
