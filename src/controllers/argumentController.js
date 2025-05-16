import Argument from '../models/Argument.js';
import mongoose from 'mongoose';

export const createArgument = async (req, res) => {
  try {
    const { text, side, clashId, parentArgumentId } = req.body;
    
    if (!text || !clashId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let finalSide = side;

    // If this is a reply, validate the parent argument exists and belongs to the same clash
    if (parentArgumentId) {
      // Validate that parentArgumentId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(parentArgumentId)) {
        console.error("Invalid parentArgumentId format:", parentArgumentId);
        return res.status(400).json({ message: "Invalid parent argument ID format" });
      }

      const parentArgument = await Argument.findById(parentArgumentId);
      if (!parentArgument) {
        console.error("Parent argument not found:", parentArgumentId);
        return res.status(404).json({ message: "Parent argument not found" });
      }
      if (parentArgument.clash.toString() !== clashId) {
        console.error("Parent argument clash mismatch:", {
          parentClash: parentArgument.clash,
          requestedClash: clashId
        });
        return res.status(400).json({ message: "Parent argument does not belong to this clash" });
      }
      // Replies are always neutral
      finalSide = 'neutral';
    } else if (!side) {
      return res.status(400).json({ message: "Side is required for top-level arguments" });
    }

    const argument = new Argument({
      text,
      side: finalSide,
      clash: clashId,
      user: req.user.id,
      parentArgumentId: parentArgumentId || null
    });

    await argument.save();
    
    // Populate user information before sending response
    await argument.populate('user', 'name picture');
    
    res.status(201).json(argument);
  } catch (err) {
    console.error("Error creating argument:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteArgument = async (req, res) => {
  try {
    const argument = await Argument.findById(req.params.id);
    if (!argument) return res.status(404).json({ message: "Argument not found" });

    if (argument.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this argument" });
    }

    // If this is a parent argument, also delete all its replies
    if (!argument.parentArgumentId) {
      await Argument.deleteMany({ parentArgumentId: argument._id });
    }

    await argument.deleteOne();
    res.status(200).json({ message: "Argument deleted successfully" });
  } catch (err) {
    console.error("Error deleting argument:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getArgumentsByClashId = async (req, res) => {
  try {
    const { clashId } = req.query;

    if (!clashId) {
      return res.status(400).json({ message: "Missing clashId in query" });
    }

    // Get all arguments for this clash, including replies
    const argumentsList = await Argument.find({ 
      clash: clashId
    })
      .populate('user', 'name picture')
      .sort({ createdAt: -1 });

    res.status(200).json(argumentsList);
  } catch (err) {
    console.error("Error fetching arguments:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 