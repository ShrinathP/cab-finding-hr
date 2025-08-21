const User = require("../models/userModel");
const Seeder = require("../models/seederModel");
const isOnRoute = require("../locationLogic/computeRouteLocation");
const convertTo24Hour = require("../utils/convertTime");

const matchSeeker = async (seekername = seekeremail, seekeremail, seekertime) => {
  try {
    //  GET Seeker Address
    // Search for user by name or email
    const user = await User.findOne({
      $or: [
        { name: new RegExp(seekername, "i") }, // Case-insensitive regex for name
        { email: seekeremail },
      ],
    });
    
    if (!user) {
      throw new Error("You haven\'t registered yet, please register using \'/users [location]\' api");
    }

    const seekeraddress = user.coordinates;

    // Get all Seeders
    const seeders = await Seeder.find({ count: 0 }); // Fetch all seeders

    // Time match
    // Check if time within 2 hrs
    const timeMatchSeeders = seeders.filter(seeder => isTimeDifferenceValid(seekertime, seeder.time, 120))

    //get all Seeder Addresses
    const seedersUserInfoArray = await Promise.all(
      timeMatchSeeders.map(async (seeder) => {
        const seedername = seeder.name;
        const seederemail = seeder.email;
        const seederinfo = await User.findOne({
          $or: [
            { name: new RegExp(seedername, "i") }, // Case-insensitive regex for name
            { email: seederemail },
          ],
        });
        return seederinfo;
      })
    );

    // Create MatcherArray
    const onRoutesPromiseArray = seedersUserInfoArray.map(async seederdata => {
      // const destinationAddress = seederdata.location;
      const destinationAddress = seederdata.coordinates;
      // const pickupAddress = "Prestige Tech Park Kadubeesanahalli, Bengaluru, Karnataka 560103";
      // Adding coordinated to Prestige Tech Park directly - to avoid getCoordinates call
      const pickupAddress = { lat: 12.943242, lng: 77.691905 };
      const locationXAddress = seekeraddress;
      const isRouteMatch =  await isOnRoute(
        pickupAddress,
        destinationAddress,
        locationXAddress
      );
      return {name: seederdata.name, isMatch: isRouteMatch}

    })
    
    let onRoutesArray = await Promise.allSettled(onRoutesPromiseArray)
    onRoutesArray = onRoutesArray.filter(result => result.status == "fulfilled")
    console.log("Shrinath", onRoutesArray);
    return onRoutesArray.map(v => v.value).filter(person => person.isMatch === true)
    
    
  } catch (error) {
    console.error("Error finding a Seeder for the Seeker:", error.message);
  }
};

// const getIstTimeNow = () => {
//   let currentTime = new Date();

//   let currentOffset = currentTime.getTimezoneOffset();

//   let ISTOffset = 330;   // IST offset UTC +5:30 

//   let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

// // ISTTime now represents the time in IST coordinates

// let hoursIST = ISTTime.getHours()
// let minutesIST = ISTTime.getMinutes()
// return {hrs: hoursIST, mins: minutesIST}
// }

function isTimeDifferenceValid(startTime, endTime, thresholdMinutes = 120) {
    // Parse time strings to get hours and minutes
    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes; // Convert to total minutes
    };
    
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    // Calculate difference in minutes
    let diffMinutes = endMinutes - startMinutes;
    
    // Check if difference is between 0 and thresholdMinutes
    return diffMinutes >= 0 && diffMinutes <= thresholdMinutes;
}

module.exports = {
  matchSeeker,
};
