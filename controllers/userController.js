const getCoordinates = require("../locationLogic/getCoordinates");
const getCoordinatesGraphHopper = require("../locationLogic/getCoordinatesGraphHopper");
const { getLocationSuggestions, getCoordinatesFromPlaceId } = require("../locationLogic/getLocationSuggestions");
const { getLocationSuggestionsPhoton, getCoordinatesFromPlaceIdPhoton } = require("../locationLogic/getLocationSuggestionsPhoton");
const User = require("../models/userModel");

// Configuration flag to choose between Google Maps and Photon API
// You can set this via environment variable: GEOCODING_PROVIDER=photon or GEOCODING_PROVIDER=google
const getCurrentGeocodingProvider = () => {
  return process.env.GEOCODING_PROVIDER || 'google'; // 'google' or 'opensource'
};



// Helper function to get location suggestions based on the configured provider
const getLocationSuggestionsForProvider = (address, maxResults = 5) => {
  const provider = getCurrentGeocodingProvider(); //Returns 'google' or 'opensource'
  if (provider === 'opensource') {
    return getLocationSuggestionsPhoton(address, maxResults);
  } else {
    return getLocationSuggestions(address, maxResults);
  }
};

// POST: Create a new user
const createUser = async (req, res, next) => {
  try {
    let { user_name: name, user_name: email, text: location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.location.includes(location)) {
      return res.status(400).json({ message: "User already exists with the same location, please use another location" });
    }

    // Get location suggestions from configured provider (Google Maps or Photon)
    const locationSuggestions = await getLocationSuggestionsForProvider(location, 5);

    if (locationSuggestions.length === 0) {
      return res.json({
        response_type: "in_channel",
        text: `❌ No locations found for "${location}". Please try a different search term.`,
      });
    }

    // Create buttons for each location suggestion
    const locationButtons = locationSuggestions.map((suggestion, index) => ({
      type: "button",
      text: {
        type: "plain_text",
        text: `${index + 1}. ${suggestion.display_name}`,
        emoji: true
      },
      style: index === 0 ? "primary" : undefined, // Highlight first option
      value: JSON.stringify({
        name,
        location: suggestion.formatted_address,
        place_id: suggestion.place_id,
        coordinates: suggestion.coordinates
      }),
      action_id: `select_location_${suggestion.id}`
    }));

    // Create blocks for the response
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👋 *${name}*, please select your location from the options below:`
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔍 Search term: "*${location}*"\n📍 Found ${locationSuggestions.length} location(s) using *${getCurrentGeocodingProvider().toUpperCase()}* API:`
        }
      }
    ];

    // Add location details as context
    const locationDetailsText = locationSuggestions.map((suggestion, index) => 
      `${index + 1}. ${suggestion.formatted_address}`
    ).join('\n');

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`${locationDetailsText}\`\`\``
      }
    });

    // Add action buttons (split into chunks of 5 due to Slack limitations)
    const buttonChunks = [];
    for (let i = 0; i < locationButtons.length; i += 5) {
      buttonChunks.push(locationButtons.slice(i, i + 5));
    }

    buttonChunks.forEach((chunk, chunkIndex) => {
      blocks.push({
        type: "actions",
        block_id: `location_selection_${chunkIndex}`,
        elements: chunk
      });
    });

    // Add cancel option
    blocks.push({
      type: "actions",
      block_id: "location_cancel",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "❌ Cancel" },
          style: "danger",
          value: JSON.stringify({ name }),
          action_id: "cancel_location_selection"
        }
      ]
    });

    const response = {
      response_type: "in_channel",
      blocks: blocks,
    };

    return res.json(response);
  } catch (err) {
    console.error('Error in createUser:', err);
    next(err); // Pass error to middleware
  }
};

const axios = require("axios");


const confirmUser = async (req, res, next) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];
    const actionData = JSON.parse(action.value);

    // Acknowledge the interaction immediately
    res.sendStatus(200);

    let messageText;

    // Handle location selection
    if (action.action_id.startsWith("select_location_")) {
      const { name, location, place_id, coordinates } = actionData;
      const email = name;

      try {
        // Create new user with the selected location
        // const newUser = new User({ 
        //   name, 
        //   email, 
        //   location, 
        //   coordinates 
        // });
        // await newUser.save();


          // Use upsert to create or update user
        const user = await User.findOneAndUpdate(
          { email }, // Find by email
          { 
            name, 
            email, 
            location, 
            coordinates 
          }, // Update with this data
          { 
            upsert: true, // Create if doesn't exist
            new: true,    // Return updated document
            runValidators: true 
          }
        );

        

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        messageText = `✅ Location for *${name}* confirmed!\n\n📍 **Selected Location:** ${location}\n🔗 <${mapsUrl}|View on Google Maps>\n\n🎉 You have been registered successfully!\n\n**Next Steps:**\n• Use \`/offer-ride [time]\` to offer rides\n• Use \`/find-ride [time]\` to find carpool options`;
      } catch (error) {
        console.error('Error creating user:', error);
        messageText = `❌ Error creating user: ${error.message}. Please try again.`;
      }
    } 
    // Handle cancel action
    else if (action.action_id === "cancel_location_selection") {
      const { name } = actionData;
      messageText = `❌ Registration cancelled for *${name}*. Please use the command again with a different location if you'd like to register.`;
    }
    else {
      messageText = "❌ Unknown action. Please try again.";
    }

    // Send response using response_url
    await axios.post(payload.response_url, {
      response_type: "in_channel",
      replace_original: true,
      text: messageText,
    });
  } catch (err) {
    console.error('Error in confirmUser:', err);
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
