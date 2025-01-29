const axios = require("axios");
const { config } = require("dotenv");
const { path } = require("../app");
require("dotenv").config({
  path: "../.env",
});

// Google API key
// const API_KEY = process.env.API_KEY; // correct

// console.log(API_KEY);

// Function to get coordinates from an address
const getCoordinates = async (address) => {
  const API_KEY = process.env.API_KEY; // correct
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

    const location = response.data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error(
      `Error fetching coordinates for address "${address}":`,
      error.message
    );
    throw error;
  }
};

// // Example usage
// (async () => {
//   // const pickupAddress = '1600 Amphitheatre Parkway, Mountain View, CA';
//   // const destinationAddress = '1 Infinite Loop, Cupertino, CA';
//   // const locationXAddress = '500 Terry Francois Blvd, San Francisco, CA';
//   const pickupAddress = 'HSR Layout';
//   const destinationAddress = 'Mahadevpura';
//   // const locationXAddress = 'Bellandur';
//   const locationXAddress = 'Jayanagar';

//   try {
//     const pickupCoordinates = await getCoordinates(pickupAddress);
//     const destinationCoordinates = await getCoordinates(destinationAddress);
//     const locationXCoordinates = await getCoordinates(locationXAddress);

//     console.log('Pickup Coordinates:', pickupCoordinates);
//     console.log('Destination Coordinates:', destinationCoordinates);
//     console.log('Location X Coordinates:', locationXCoordinates);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();

module.exports = getCoordinates;
