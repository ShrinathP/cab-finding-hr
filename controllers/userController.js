const getCoordinates = require("../locationLogic/getCoordinates");
const getCoordinatesGraphHopper = require("../locationLogic/getCoordinatesGraphHopper");
const User = require("../models/userModel");

// POST: Create a new user
const createUser = async (req, res, next) => {
  try {
    const { text } = req.body;
    const [name, ...rest] = text.split(" ");
    const location = rest.join(" ");
    const email = name;

    // const name, email = user_name
    // const { user_name: name, user_name: email, location: location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const response = ({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `👋 *${name}*'s location: <${mapsUrl}|📍 View on Google Maps>\n`
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Is this the correct location?"
          }
        },
        {
          type: "actions",
          block_id: "location_confirmation",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "✅ Yes" },
              style: "primary",
              value: JSON.stringify({ name, location }),
              action_id: "confirm_location"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "❌ No" },
              style: "danger",
              value: JSON.stringify({ name, location }),
              action_id: "reject_location"
            }
          ]
        }
      ],
    });
    return res.json(response);
  } catch (err) {
    next(err); // Pass error to middleware
  }
};

const axios = require("axios");

const confirmUser = async (req, res, next) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];
    const { name, location } = JSON.parse(action.value);

    // Acknowledge the interaction immediately
    res.sendStatus(200);

    let messageText;
    if (action.action_id === "confirm_location") {
      // Create new user
      const coordinates = await getCoordinates(location);
      const email = name;
      const newUser = new User({ name, email, location, coordinates });
      await newUser.save();
      messageText = `✅ Location for *${name}* confirmed: ${location}\n\nYou have been registered successfully. Use \`/offer-ride [time]\` to offer rides and \`/find-ride [time]\` to find car pool options.`;
    } else {
      messageText = "❌ Location was rejected. Please re-enter with the correct address.";
    }

    // Send response using response_url
    await axios.post(payload.response_url, {
      response_type: "in_channel",
      replace_original: true,
      text: messageText,
    });
  } catch (err) {
    next(err);
  }
};

// const createUser = async (req, res, next) => {
//   try {
//     const { name, email, location } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const coordinates = await getCoordinates(location);
//     // Create new user
//     const newUser = new User({ name, email, location, coordinates});
//     await newUser.save();

//     res.status(201).json({
//       message: "User created successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//       },
//     });
//   } catch (err) {
//     next(err); // Pass error to middleware
//   }
// };

// GET all users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

// GET a single user by ID
const getUserByName = async (req, res, next) => {
  try {
    const { email } = req.params;

    // Find user by Email
    const user = await User.findOne({
      $or: [
        { name: new RegExp(email, "i") }, // Case-insensitive regex for name
        { email: email },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
};

// DELETE: Delete a user by Name
const deleteUserByName = async (req, res) => {
  try {
    const { email } = req.params; // Extract user ID from the route parameters

    // Check if the user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  confirmUser,
  getUsers,
  getUserByName,
  deleteUserByName,
};
