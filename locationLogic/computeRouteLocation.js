const RouteLocationChecker = require("./RouteLocationChecker");
const RouteLocationCheckerGraphHopper = require("./RouteLocationCheckerGraphHopper");
const getCoordinates = require("./getCoordinates");

// Initialize RouteLocationChecker with Google API Key
require("dotenv").config({
  path: "../.env",
});

const isOnRoute = async (
  pickupAddress,
  destinationAddress,
  locationXAddress
) => {
  const GEOCODING_PROVIDER = process.env.GEOCODING_PROVIDER || 'google'; // 'google' or 'opensource'
  const apiKey = process.env.API_KEY;
  let routeChecker = null;
    // if (GEOCODING_PROVIDER === 'opensource') {
    //   routeChecker = new RouteLocationCheckerGraphHopper();
    // } else {
      routeChecker = new RouteLocationChecker(apiKey);
    // }
  // 
  // destinationCoordinates can be calculated and kept in db only while creating User Model
  // const destinationCoordinates = await getCoordinates(destinationAddress);

  // pickupCorodinates are fixed - office - can be hardcoded
  // const pickupCoordinates = await getCoordinates(pickupAddress);
  // console.log("Pickup Coordinates: ", pickupCoordinates);
  
  // locationXCoordinates can also be searched from UserModel data in db and sent here
  // const locationXCoordinates = await getCoordinates(locationXAddress);

  try {
    const isOnRoute = await routeChecker.checkIfLocationIsOnRoute(
      // pickupCoordinates,
      pickupAddress,
      // destinationCoordinates,
      destinationAddress,
      // locationXCoordinates
      locationXAddress
    );

    // console.log("Shrinathhhh", isOnRoute);

    return isOnRoute;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Define pickup, destination, and location to check

// const pickup =  { lat: 12.9121181, lng: 77.6445548 };
// const destination = { lat: 12.9880043, lng: 77.6893675 };
// const locationX =  { lat: 12.9308107, lng: 77.58385770000001 };

// (async () => {
//   try {
//     const isOnRoute = await routeChecker.checkIfLocationIsOnRoute(pickup, destination, locationX, 5000);
//     if (isOnRoute) {
//       console.log('The location is on or near the route.');
//     } else {
//       console.log('The location is not on the route.');
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();

module.exports = isOnRoute;
