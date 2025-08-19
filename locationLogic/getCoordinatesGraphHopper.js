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
  try {

    //Photon geocoding api
    // GraphHopper Geocoding API URL (replace with your self-hosted URL if needed)
    // const url = `http://localhost:8989/geocode?q=${encodeURIComponent(address)}`;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}`;

    // Make a GET request to GraphHopper Geocoding API
    const response = await axios.get(url);

    // Check if GraphHopper returned results
    if (response.data.features.length === 0) {
      throw new Error(`Geocoding failed: No results found for address "${address}"`);
    }

    // Get the first result
    const [longitude, latitude] = response.data.features[0].geometry.coordinates;
    // 77, 12
    
    // Return the coordinates
    return {
      lat: latitude,
      lng: longitude,
    };
  } catch (error) {
    console.error(`Error fetching coordinates for address "${address}":`, error.message);
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
