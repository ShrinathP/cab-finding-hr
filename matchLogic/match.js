const User = require("../models/userModel");
const Seeder = require("../models/seederModel");
const isOnRoute = require("../locationLogic/computeRouteLocation");

const matchSeeker = async (seekername = seekeremail, seekeremail, seekertime) => {
  try {
    if (!seekeremail) {
      // return res.status(400).json({ message: 'Please provide a name or email to search.' });
      return "Missing seekername or seeder name";
    }

    //  GET Seeker Address
    // Search for user by name or email
    const user = await User.findOne({
      $or: [
        { name: new RegExp(seekername, "i") }, // Case-insensitive regex for name
        { email: seekeremail },
      ],
    });

    if (!user) {
      console.log("No seeker found, ensure youre registered");
    }

    const seekeraddress = user.coordinates;

    // Get all Seeders
    const seeders = await Seeder.find({ count: 0 }); // Fetch all seeders

    // Check if time within 30 mins
    const timeNow = getIstTimeNow();
    const timeMatchSeeders = seeders.filter(seeder => (0 < (seeder.time.split(":")[0] - seekertime.split(":")[0]) < 30))

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
        // console.log(seederinfo);
        return seederinfo;
      })
    );

    // Create MatcherArray
    

    const onRoutesPromiseArray = seedersUserInfoArray.map(async seederdata => {
      // const destinationAddress = seederdata.location;
      const destinationAddress = seederdata.coordinates;
      // const pickupAddress = "Prestige Tech Park Kadubeesanahalli, Bengaluru, Karnataka 560103";
      // Adding coordinated to Prestige Tech Park directly - to avoid getCoordinates call
      const pickupAddress = { lat: 12.9432425, lng: 77.69190569999999 };
      const locationXAddress = seekeraddress;
      const isRouteMatch =  await isOnRoute(
        pickupAddress,
        destinationAddress,
        locationXAddress
      );
      return {name: seederdata.name, isMatch: isRouteMatch}

    })

    
    const onRoutesArray = await Promise.all(onRoutesPromiseArray)
    return onRoutesArray
    
  } catch (error) {
    console.error("Error finding a Seeder for the Seeker:", error.message);
  }
};

const getIstTimeNow = () => {
  let currentTime = new Date();

  let currentOffset = currentTime.getTimezoneOffset();

  let ISTOffset = 330;   // IST offset UTC +5:30 

  let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

// ISTTime now represents the time in IST coordinates

let hoursIST = ISTTime.getHours()
let minutesIST = ISTTime.getMinutes()
return {hrs: hoursIST, mins: minutesIST}
}

module.exports = {
  matchSeeker,
};
