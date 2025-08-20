const Seeker = require("../models/seekerModel");
const match = require("../matchLogic/match")
const convertTo24Hour = require('../utils/convertTime')
const User = require("../models/userModel");

// POST: Create a new user
const createSeeker = async (req, res, next) => {
  try {
    // const { name, email, time } = req.body;
    let { user_name: name, user_name: email, text: time } = req.body;
    time = convertTo24Hour(time)

    // Check if the Seeder is a Registered User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        response_type: "in_channel",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "The user is not registered, please make sure, you register using POST api",
            },
          },
        ],
      });
    }

    // Check if Seeder already exists
    const seeker = await Seeker.findOne({ email });
    if (seeker) {
      await seeker.deleteOne({ email: email });
      // return res.status(400).json({ message: "Seeker already exists" });
    }

    // Create newSeeder
    const newSeeker = new Seeker({ name, email, time });
    await newSeeker.save();

    const result = await match.matchSeeker(name, email, time);

    let responseMessage;
    if (result.length == 0) {
      responseMessage = "We haven't got any car pool match for you right away. We will message you as and when we get one.";
    } else {
      const list = result
        .filter((s) => !s.name.includes(email))
        .map((person) => `${person.name}@nutanix.com`);
      // Using slice and join with comma, join the last element using AND
      const outputString = list.slice(0, -1).join(', ') + (list.length > 1 ? ' and ' : '') + list.slice(-1);
      responseMessage = "We have got a car pool match for you with "+ `${outputString}` + ". You can connect with them over Slack.";
    }
    
    

    res.status(201).json({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: responseMessage,
          },
        },
      ],
    });
  } catch (err) {
    next(err); // Pass error to middleware
  }
};

// GET all seeders
const getSeekers = async (req, res, next) => {
  try {
    const seekers = await Seeker.find(); // Fetch all users
    res.status(200).json(seekers);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

// GET a single user by ID
const getSeekerByName = async (req, res, next) => {
  try {
    const { email } = req.params;

    // Find user by ID
    const seeker = await Seeker.findOne({
      $or: [
        { name: new RegExp(email, "i") }, // Case-insensitive regex for name
        { email: email },
      ],
    });

    if (!seeker) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(seeker);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

const deleteSeekerByName = async (req, res) => {
  try {
    const { email } = req.params; // Extract user ID from the route parameters

    // Check if the user exists
    const seeker = await Seeker.findOne({ email: email });
    if (!seeker) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    // await seeder.findByIdAndDelete(seeder._id);
    // await seeder.deleteOne( {"seeder.email": email})
    await seeker.deleteOne({ email: email });

    res.status(200).json({ message: "Seeker deleted successfully" });
  } catch (error) {
    console.error("Error deleting seeder:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSeeker,
  getSeekers,
  getSeekerByName,
  deleteSeekerByName,
};
