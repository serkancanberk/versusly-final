import Reaction from '../models/Reaction.js';

// GET /api/reactions/:clashId
export const getReactionsForClash = async (req, res) => {
  const { clashId } = req.params;
  try {
    const reactions = await Reaction.find({ clashId });

    const validReactions = ['nailed_it', 'fair_point', 'neutral', 'really', 'try_again'];
    const initialTotals = validReactions.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    const rawTotals = reactions.reduce((acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});

    const totals = { ...initialTotals, ...rawTotals };

    let userReaction = null;
    if (req.user && req.user._id) {
      const userId = req.user._id.toString();
      const matched = reactions.find(r => r.userId.toString() === userId);
      userReaction = matched?.reaction || null;
    }

    // Mapping backend keys to UI labels
    const labelMap = {
      nailed_it: 'Nailed It',
      fair_point: 'Fair Point',
      neutral: "Can't Decide",
      really: 'Really?',
      try_again: 'Try Again',
    };

    const formattedTotals = Object.entries(totals).reduce((acc, [key, value]) => {
      const label = labelMap[key] || key;
      acc[label] = value;
      return acc;
    }, {});

    res.json({ totals: formattedTotals, userReaction });
  } catch (err) {
    console.error('GET /api/reactions/:clashId failed:', err.message);
    res.status(500).json({ message: 'Failed to fetch reactions' });
  }
};

// POST /api/reactions
export const postReaction = async (req, res) => {
  const { clashId, reaction } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    console.error('Missing userId in postReaction');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const validReactions = ['nailed_it', 'fair_point', 'neutral', 'really', 'try_again'];
  if (!validReactions.includes(reaction)) {
    return res.status(400).json({ message: 'Invalid reaction value' });
  }

  if (!clashId || !reaction) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existing = await Reaction.findOne({ clashId, userId });
    let newReaction = null;
    if (existing) {
      existing.reaction = reaction;
      await existing.save();
    } else {
      newReaction = await Reaction.create({ clashId, reaction, userId });
    }

    // Shared logic: recompute totals and userReaction
    const updatedReactions = await Reaction.find({ clashId });

    const validReactions = ['nailed_it', 'fair_point', 'neutral', 'really', 'try_again'];
    const initialTotals = validReactions.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    const rawTotals = updatedReactions.reduce((acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});

    const totals = { ...initialTotals, ...rawTotals };
    const labelMap = {
      nailed_it: 'Nailed It',
      fair_point: 'Fair Point',
      neutral: "Can't Decide",
      really: 'Really?',
      try_again: 'Try Again',
    };

    const formattedTotals = Object.entries(totals).reduce((acc, [key, value]) => {
      const label = labelMap[key] || key;
      acc[label] = value;
      return acc;
    }, {});
    console.log(">>> [POST] updatedReactions:", updatedReactions);
    console.log(">>> [POST] rawTotals:", rawTotals);
    console.log(">>> [POST] formattedTotals:", formattedTotals);

    return res.status(200).json({
      message: existing ? 'Reaction updated' : 'Reaction added',
      reaction: existing || newReaction,
      totals: formattedTotals,
      userReaction: reaction
    });
  } catch (err) {
    console.error('POST /api/reactions failed:', err.message);
    res.status(500).json({ message: 'Failed to post reaction' });
  }
};

// DELETE /api/reactions
export const deleteReaction = async (req, res) => {
  try {
    const { clashId } = req.body;
    const userId = req.user?._id;
    // Delete the reaction record
    await Reaction.deleteOne({ clashId, userId });
    // Recompute live totals
    const updatedReactions = await Reaction.find({ clashId });
    const validReactions = ['nailed_it', 'fair_point', 'neutral', 'really', 'try_again'];
    const initialTotals = validReactions.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    const rawTotals = updatedReactions.reduce((acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});
    const totals = { ...initialTotals, ...rawTotals };
    const labelMap = {
      nailed_it: 'Nailed It',
      fair_point: 'Fair Point',
      neutral: "Can't Decide",
      really: 'Really?',
      try_again: 'Try Again',
    };
    const formattedTotals = Object.entries(totals).reduce((acc, [key, value]) => {
      const label = labelMap[key] || key;
      acc[label] = value;
      return acc;
    }, {});
    return res.status(200).json({
      message: 'Reaction deleted',
      totals: formattedTotals,
      userReaction: null
    });
  } catch (err) {
    console.error('DELETE /api/reactions failed:', err.message);
    res.status(500).json({ message: 'Failed to delete reaction' });
  }
};