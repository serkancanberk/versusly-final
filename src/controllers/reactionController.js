import Reaction from '../models/Reaction.js';

// GET /api/reactions/:clashId
export const getReactionsForClash = async (req, res) => {
  const { clashId } = req.params;
  try {
    const reactions = await Reaction.find({ clashId });

    console.log('All reactions for this clash:', reactions);
    console.log('Requesting userId:', req.user?._id?.toString());

    const totals = reactions.reduce((acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});

    let userReaction = null;
    if (req.user && req.user._id) {
      const userId = req.user._id.toString();
      const matched = reactions.find(r => r.userId.toString() === userId);
      userReaction = matched?.reaction || null;
    }

    res.json({ totals, userReaction });
  } catch (err) {
    console.error('Error fetching reactions:', err);
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

  console.log('Creating/updating reaction:', { clashId, reaction, userId });

  try {
    const existing = await Reaction.findOne({ clashId, userId });
    if (existing) {
      existing.reaction = reaction;
      await existing.save();
      return res.json({ message: 'Reaction updated', reaction: existing });
    }

    const newReaction = await Reaction.create({ clashId, reaction, userId });
    res.status(201).json({ message: 'Reaction added', reaction: newReaction });
  } catch (err) {
    console.error('Error posting reaction:', err);
    res.status(500).json({ message: 'Failed to post reaction' });
  }
};

// DELETE /api/reactions
export const deleteReaction = async (req, res) => {
  const { clashId } = req.body;
  const userId = req.user?._id;

  try {
    await Reaction.findOneAndDelete({ clashId, userId });
    res.json({ message: 'Reaction deleted' });
  } catch (err) {
    console.error('Error deleting reaction:', err);
    res.status(500).json({ message: 'Failed to delete reaction' });
  }
};