const axios = require("axios");

// Function to get multiple location suggestions from Photon Geocoding API (OpenStreetMap)
const getLocationSuggestionsPhoton = async (address, maxResults = 5) => {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}`;
    const response = await axios.get(url);

    if (!response.data.features || response.data.features.length === 0) {
      return [];
    }

    // Transform Photon response to match Google Maps response format
    const suggestions = response.data.features.slice(0, maxResults).map((feature, index) => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates; // [longitude, latitude]
      
      // Build formatted address from available properties
      const addressParts = [];
      if (props.name) addressParts.push(props.name);
      if (props.street) addressParts.push(props.street);
      if (props.locality) addressParts.push(props.locality);
      if (props.district) addressParts.push(props.district);
      if (props.state) addressParts.push(props.state);
      if (props.postcode) addressParts.push(props.postcode);
      if (props.country) addressParts.push(props.country);
      
      const formatted_address = addressParts.join(', ');
      
      // Create display name (shorter version for buttons)
      const displayParts = [];
      if (props.name) displayParts.push(props.name);
      if (props.district && props.district !== props.name) displayParts.push(props.district);
      else if (props.locality && props.locality !== props.name) displayParts.push(props.locality);
      
      const display_name = displayParts.slice(0, 2).join(', ').trim() || formatted_address.split(',').slice(0, 2).join(',').trim();
      
      // Map OSM types to something similar to Google Maps types
      const types = [];
      if (props.osm_key && props.osm_value) {
        types.push(`${props.osm_key}_${props.osm_value}`);
      }
      if (props.type) {
        types.push(props.type);
      }
      // Add some common types based on OSM data
      if (props.osm_key === 'amenity') types.push('establishment');
      if (props.osm_key === 'landuse') types.push('premise');
      if (props.type === 'locality') types.push('locality', 'political');

      return {
        id: index,
        formatted_address: formatted_address,
        place_id: `osm_${props.osm_type}_${props.osm_id}`, // Create a unique ID from OSM data
        coordinates: {
          lat: coords[1], // Photon returns [lng, lat], we need {lat, lng}
          lng: coords[0],
        },
        types: types,
        display_name: display_name,
        // Additional Photon-specific data that might be useful
        osm_data: {
          osm_type: props.osm_type,
          osm_id: props.osm_id,
          osm_key: props.osm_key,
          osm_value: props.osm_value,
        }
      };
    });

    return suggestions;
  } catch (error) {
    console.error(
      `Error fetching location suggestions from Photon for address "${address}":`,
      error.message
    );
    throw error;
  }
};

// Function to get coordinates from OSM place_id (for when user selects a specific option)
// Note: This is a simplified version since Photon doesn't have a direct place_id lookup
// We'll extract coordinates from the place_id we created
const getCoordinatesFromPlaceIdPhoton = async (placeId) => {
  try {
    // Since we created the place_id format as "osm_${type}_${id}", we could potentially
    // use OSM API to get details, but for now we'll just return an error since
    // the coordinates should already be available from the selection
    throw new Error("Coordinates should be available from the location selection. Photon doesn't support direct place_id lookup.");
  } catch (error) {
    console.error(
      `Error fetching coordinates from Photon for place_id "${placeId}":`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  getLocationSuggestionsPhoton,
  getCoordinatesFromPlaceIdPhoton,
};
