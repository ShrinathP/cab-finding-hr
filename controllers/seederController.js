const Seeder = require("../models/seederModel");
const User = require("../models/userModel");
const convertTo24Hour = require("../utils/convertTime");

// POST: Create a new user
const createSeeder = async (req, res, next) => {
  try {
    let { user_name: name, user_name: email, text: time } = req.body;
    time = convertTo24Hour(time);

    // Check if the Seeder is a Registered User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        response_type: "in_channel",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "The user is not registered, please make sure, you register using \"/users [location]\" api",
            },
          },
        ],
      });
    }

    // Check if Seeder already exists
    const seeder = await Seeder.findOne({ email });
    if (seeder) {
      await seeder.deleteOne({ email: email });
    }

    // Create newSeeder
    const newSeeder = new Seeder({ name, email, time });
    await newSeeder.save();

    res.status(201).json({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `We have successfully registered your offer and will share your info with those who are looking to take a car pool if their locality comes across your route.`,
          },
        },
      ],
    });
  } catch (err) {
    next(err); // Pass error to middleware
  }
};


// GET all seeders
const getSeeders = async (req, res, next) => {
  try {
    const seeders = await Seeder.find(); // Fetch all users
    res.status(200).json(seeders);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

// GET a single user by ID
const getSeederByName = async (req, res, next) => {
  try {
    const { email } = req.params;
    // Find user by ID
    const seeder = await Seeder.findOne({
      $or: [
        { name: new RegExp(email, "i") }, // Case-insensitive regex for name
        { email: email },
      ],
    });

    if (!seeder) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(seeder);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

const deleteSeederByName = async (req, res, next) => {
  try {
    const { user_name: email } = req.body; // Extract user ID from the route parameters

    // Check if the user exists
    const seeder = await Seeder.findOne({ email: email });
    
    if(!seeder){
    return res.status(200).json({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "You haven't offered any ride yet. Please offer a ride using \"/offer-ride-at [time]\" api",
          },
        },
      ],
    });
  }

    // Delete the user
    // await seeder.findByIdAndDelete(seeder._id);
    // await seeder.deleteOne( {"seeder.email": email})
    await seeder.deleteOne({ email: email });

//     res.status(200).json({ message: "Seeder deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting seeder:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
res.status(200).json({
  response_type: "in_channel",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Perfect! You have been successfully removed from the available seeders list. Thank you for offering the ride! 🚗`,
      },
    },
  ],
});

} catch (err) {
console.error("Error marking seeder as full:", error.message);
next(err);
}
};

module.exports = {
  createSeeder,
  getSeeders,
  getSeederByName,
  deleteSeederByName,
};
