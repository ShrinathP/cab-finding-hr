const axios = require("axios");
require("dotenv").config({
  path: "../.env",
});

// Function to get multiple location suggestions from Google Maps Geocoding API
const getLocationSuggestions = async (address, maxResults = 5) => {
  const API_KEY = process.env.API_KEY;
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: address,
          key: API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    // Return multiple results (up to maxResults)
    const suggestions = response.data.results.slice(0, maxResults).map((result, index) => ({
      id: index,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      types: result.types,
      // Extract useful display components
      display_name: result.formatted_address.split(',').slice(0, 2).join(',').trim(),
    }));

    return suggestions;
  } catch (error) {
    console.error(
      `Error fetching location suggestions for address "${address}":`,
      error.message
    );
    throw error;
  }
};

// Function to get coordinates from place_id (for when user selects a specific option)
const getCoordinatesFromPlaceId = async (placeId) => {
  const API_KEY = process.env.API_KEY;
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          place_id: placeId,
          key: API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };
  } catch (error) {
    console.error(
      `Error fetching coordinates for place_id "${placeId}":`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  getLocationSuggestions,
  getCoordinatesFromPlaceId,
};
