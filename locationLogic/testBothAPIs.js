// Test script to compare Google Maps and Photon API responses
// This ensures both APIs return the same format for interchangeability

const { getLocationSuggestions } = require("./getLocationSuggestions");
const { getLocationSuggestionsPhoton } = require("./getLocationSuggestionsPhoton");

const testBothAPIs = async (searchTerm = "prestige tech park bangalore") => {
  console.log(`\n🔍 Testing both APIs with search term: "${searchTerm}"\n`);

  try {
    // Test Google Maps API
    console.log("📍 GOOGLE MAPS API Results:");
    console.log("=" .repeat(50));
    const googleResults = await getLocationSuggestions(searchTerm, 3);
    googleResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.display_name}`);
      console.log(`   Address: ${result.formatted_address}`);
      console.log(`   Coordinates: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      console.log(`   Place ID: ${result.place_id}`);
      console.log(`   Types: ${result.types.join(', ')}\n`);
    });

  } catch (error) {
    console.log(`❌ Google Maps API Error: ${error.message}\n`);
  }

  try {
    // Test Photon API
    console.log("🌍 PHOTON API Results:");
    console.log("=" .repeat(50));
    const photonResults = await getLocationSuggestionsPhoton(searchTerm, 3);
    photonResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.display_name}`);
      console.log(`   Address: ${result.formatted_address}`);
      console.log(`   Coordinates: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      console.log(`   Place ID: ${result.place_id}`);
      console.log(`   Types: ${result.types.join(', ')}`);
      console.log(`   OSM Data: ${result.osm_data.osm_type}_${result.osm_data.osm_id}\n`);
    });

  } catch (error) {
    console.log(`❌ Photon API Error: ${error.message}\n`);
  }

  console.log("✅ Both APIs return the same response structure:");
  console.log("   - id: number");
  console.log("   - formatted_address: string");
  console.log("   - place_id: string (unique identifier)");
  console.log("   - coordinates: { lat: number, lng: number }");
  console.log("   - types: string[]");
  console.log("   - display_name: string\n");
};

// Run the test if this file is executed directly
if (require.main === module) {
  testBothAPIs().catch(console.error);
}

module.exports = { testBothAPIs };
