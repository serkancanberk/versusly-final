import Reaction from "../models/Reaction.js";
import Clash from "../models/Clash.js";
import mongoose from "mongoose";

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
      sideLabels,
      side
    } = req.body;

    const rawTags = Array.isArray(tags) ? tags : [];
    const formattedTags = rawTags.map(tag => tag.trim()).filter(tag => tag.length > 0);

    // Validate and format sideLabels if provided
    let formattedSideLabels;
    if (sideLabels) {
      formattedSideLabels = {
        sideA: {
          label: sideLabels.sideA?.label || "Side A",
          value: "for"
        },
        sideB: {
          label: sideLabels.sideB?.label || "Side B",
          value: "against"
        },
        neutral: {
          label: sideLabels.neutral?.label || "Neutral",
          value: "neutral"
        }
      };
    }

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
      sideLabels: formattedSideLabels
    });

    // Convert side value and add initial vote if side is provided
    if (side && req.user) {
      let sideValue = null;
      
      // Convert 'A'/'B' to 'for'/'against'
      if (side === 'A') sideValue = 'for';
      else if (side === 'B') sideValue = 'against';
      else sideValue = 'neutral';

      // Only push vote if we have a valid side value
      if (sideValue) {
        newClash.votes.push({
          userId: req.user._id,
          side: sideValue,
          timestamp: new Date()
        });
      }
    }

    console.log("Formatted Tags:", formattedTags);
    console.log("New Clash Object Before Save:", newClash);
    console.log("Clash to be saved:", newClash);

    await newClash.save();
    console.log("Saved clash:", newClash);

    // Populate the creator field before sending the response
    const populatedClash = await Clash.findById(newClash._id)
      .populate("creator", "name picture email")
      .populate("votes.userId", "name picture email");
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
    // Fetch the clash and populate creator and arguments' user data
    const clash = await Clash.findById(id)
      .populate("creator", "name picture email")
      .populate({
        path: "Clash_arguments.user",
        select: "name picture"
      });
    
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
    // Enhance each argument's side field with its corresponding label from sideLabels,
    // handling both string and object formats for backward compatibility.
    if (obj.Clash_arguments && obj.sideLabels) {
      obj.Clash_arguments = obj.Clash_arguments.map(arg => {
        let rawSide = arg.side;
        let value = typeof rawSide === 'string' ? rawSide : rawSide?.value;
        let label = typeof rawSide === 'string' ? null : rawSide?.label;

        // Fix: properly match string or object 'value' with sideLabels
        if (!label || label === "Unknown") {
          if (value === "for") label = obj.sideLabels.sideA?.label || "Side A";
          else if (value === "against") label = obj.sideLabels.sideB?.label || "Side B";
          else if (value === "neutral") label = obj.sideLabels.neutral?.label || "Neutral";
          else label = "Unknown";
        }

        return {
          ...arg,
          side: { value, label }
        };
      });
    }
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

    // First, perform text search with textScore
    const textSearchResults = await Clash.find(
      { $text: { $search: q } },
      { 
        score: { $meta: "textScore" },
        vs_title: 1,
        vs_statement: 1,
        tags: 1,
        creator: 1,
        createdAt: 1,
        expires_at: 1,
        reactions: 1,
        Clash_arguments: 1
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .populate("creator", "name picture email");

    // Calculate similarity scores
    const resultsWithScores = textSearchResults.map(clash => {
      // Get text score (normalized between 0 and 1)
      const textScore = clash._doc.score || 0;
      
      // Calculate tag match score
      const queryTags = q.toLowerCase().split(/\s+/).filter(tag => tag.length > 2);
      const tagMatchScore = clash.tags.reduce((score, tag) => {
        return score + (queryTags.some(qTag => tag.toLowerCase().includes(qTag)) ? 1 : 0);
      }, 0) / Math.max(1, clash.tags.length);

      // Combine scores (70% text score, 30% tag match)
      const similarityScore = (textScore * 0.7) + (tagMatchScore * 0.3);

      return {
        ...clash._doc,
        similarityScore
      };
    });

    // Sort by combined similarity score
    resultsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    res.status(200).json(resultsWithScores);
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

export const getSimilarClashes = async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the current clash to find its tags
    const currentClash = await Clash.findById(id);
    if (!currentClash) {
      return res.status(404).json({ message: "Clash not found" });
    }

    // Get the tags from the current clash
    const currentTags = currentClash.tags || [];
    if (currentTags.length === 0) {
      return res.json([]); // Return empty array if no tags
    }

    // Find clashes that share at least one tag with the current clash
    const similarClashes = await Clash.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(id) }, // Exclude current clash
          tags: { $in: currentTags } // Match clashes with at least one matching tag
        }
      },
      {
        $addFields: {
          // Calculate number of matching tags
          matchingTags: {
            $size: {
              $setIntersection: ["$tags", currentTags]
            }
          }
        }
      },
      {
        $sort: { matchingTags: -1 } // Sort by number of matching tags (descending)
      },
      {
        $limit: 5 // Limit to 5 results
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator"
        }
      },
      {
        $unwind: "$creator"
      },
      {
        $project: {
          _id: 1,
          vs_title: 1,
          vs_statement: 1,
          tags: 1,
          createdAt: 1,
          expires_at: 1,
          reactions: 1,
          matchingTags: 1,
          "creator.name": 1,
          "creator.picture": 1,
          "creator.email": 1
        }
      }
    ]);

    res.status(200).json(similarClashes);
  } catch (error) {
    console.error("Error finding similar clashes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};