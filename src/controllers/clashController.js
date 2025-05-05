import Clash from "../models/Clash.js";

export const createClash = async (req, res) => {
  try {
    const {
      vs_title,
      vs_statement,
      vs_argument,
      tags = [],
      expires_at,
      duration,
      reactions = {},
      status = "active"
    } = req.body;

    const rawTags = Array.isArray(tags) ? tags : [];
    const formattedTags = rawTags.map(tag => tag.trim()).filter(tag => tag.length > 0);

    const newClash = new Clash({
      vs_title,
      vs_statement,
      vs_argument,
      tags: formattedTags,
      expires_at,
      duration,
      reactions,
      status,
      creator: req.user._id,
    });

    console.log("Formatted Tags:", formattedTags);
    console.log("New Clash Object Before Save:", newClash);
    console.log("Clash to be saved:", newClash);

    await newClash.save();
    console.log("Saved clash:", newClash);

    // Populate the creator field before sending the response
    const populatedClash = await Clash.findById(newClash._id).populate("creator", "name picture email");
    console.log("Final clash object sent in response:", populatedClash);
    res.status(201).json(populatedClash);
  } catch (error) {
    console.error("Error creating clash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getClashes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    const clashes = await Clash.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("creator", "name picture email");

    console.log("Fetched clashes with pagination:", clashes);
    res.status(200).json(clashes);
  } catch (error) {
    console.error("Error fetching paginated clashes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};