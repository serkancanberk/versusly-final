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
      status = "active",
      creator,
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
      creator,
    });

    console.log("Formatted Tags:", formattedTags);
    console.log("New Clash Object Before Save:", newClash);
    console.log("Clash to be saved:", newClash);

    await newClash.save();
    console.log("Saved clash:", newClash);

    console.log("Final clash object sent in response:", newClash);
    res.status(201).json(newClash);
  } catch (error) {
    console.error("Error creating clash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllClashes = async (req, res) => {
  try {
    const clashes = await Clash.find();
    console.log("Fetched clashes:", clashes);
    res.status(200).json(clashes);
  } catch (error) {
    console.error("Error fetching clashes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};