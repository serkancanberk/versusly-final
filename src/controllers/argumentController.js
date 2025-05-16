import Argument from '../models/Argument.js';

export const createArgument = async (req, res) => {
  try {
    const { text, side, clashId } = req.body;
    
    if (!text || !side || !clashId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const argument = new Argument({
      text,
      side,
      clash: clashId,
      user: req.user.id
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

    const argumentsList = await Argument.find({ clash: clashId })
      .populate('user', 'name picture')
      .sort({ createdAt: -1 });

    res.status(200).json(argumentsList);
  } catch (err) {
    console.error("Error fetching arguments:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 