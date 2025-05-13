import Reaction from "../models/Reaction.js";
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
    // Fetch paginated clashes
    const rawClashes = await Clash.find()
      .sort({ createdAt: -1 })
      .populate("creator", "name picture email");

    // For each clash, compute live reaction totals
    const clashes = await Promise.all(rawClashes.map(async clash => {
      const reactionDocs = await Reaction.find({ clashId: clash._id });

      const validReactions = ['nailed_it','fair_point','neutral','really','try_again'];
      const initialTotals = validReactions.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});

      const rawTotals = reactionDocs.reduce((acc, r) => {
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

      // Return the clash object with updated reactions field
      const obj = clash.toObject();
      obj.reactions = formattedTotals;
      return obj;
    }));

    console.log("Fetched clashes with pagination:", clashes);
    res.status(200).json(clashes);
  } catch (error) {
    console.error("Error fetching paginated clashes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Handler for getting a single clash by ID with live reaction totals
export const getClashById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the clash and populate creator
    const clash = await Clash.findById(id).populate("creator", "name picture email");
    if (!clash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    // Compute live reaction totals
    const reactionDocs = await Reaction.find({ clashId: clash._id });
    const validReactions = ['nailed_it','fair_point','neutral','really','try_again'];
    const initialTotals = validReactions.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    const rawTotals = reactionDocs.reduce((acc, r) => {
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

    // Return the clash object with live reactions field
    const obj = clash.toObject();
    obj.reactions = formattedTotals;
    res.status(200).json(obj);
  } catch (error) {
    console.error("Error fetching clash by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchClashes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ message: "Query too short" });
    }

    const results = await Clash.find({
      $or: [
        { vs_title: { $regex: q, $options: "i" } },
        { vs_statement: { $regex: q, $options: "i" } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("creator", "name picture email");

    res.status(200).json(results);
  } catch (error) {
    console.error("Error in searchClashes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getClashesByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    if (!tagName) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const clashes = await Clash.find({ tags: tagName })
      .sort({ createdAt: -1 })
      .populate("creator", "name picture email");

    // Compute live reaction totals for each clash
    const clashesWithReactions = await Promise.all(clashes.map(async clash => {
      const reactionDocs = await Reaction.find({ clashId: clash._id });
      const validReactions = ['nailed_it','fair_point','neutral','really','try_again'];
      const initialTotals = validReactions.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});

      const rawTotals = reactionDocs.reduce((acc, r) => {
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

      const obj = clash.toObject();
      obj.reactions = formattedTotals;
      return obj;
    }));

    res.status(200).json(clashesWithReactions);
  } catch (error) {
    console.error("Error fetching clashes by tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};