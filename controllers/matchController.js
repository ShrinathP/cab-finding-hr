const { matchSeeker } = require("../matchLogic/match");
const User = require("../models/userModel");
const Seeker = require("../models/seekerModel");

// POST: Run a match
const runMatch = async (req, res, next) => {
  try {
    const seekers = await Seeker.find();
    const matchResults = await Promise.all(
      seekers.map(async (seeker) => {
        const result = await matchSeeker(
          seeker.email,
          seeker.email,
          seeker.time
        );
        return { seeker: seeker.email, result: result };
      })
    );

    res.status(201).json({
      matchResults: matchResults,
    });
  } catch (err) {
    next(err); // Pass error to middleware
  }
};

module.exports = {
  runMatch,
};
