const axios = require("axios");
const turf = require("@turf/turf");

class RouteLocationChecker {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  // Fetch route polyline from Google Directions API
  async getRoutePolyline(pickup, destination) {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        {
          params: {
            origin: `${pickup.lat},${pickup.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            mode: "driving",
            key: this.apiKey,
          },
        }
      );

      if (response.data.routes.length === 0) {
        throw new Error("No routes found");
      }

      // Decode the polyline
      const polyline = response.data.routes[0].overview_polyline.points;
      return this.decodePolyline(polyline);
    } catch (error) {
      console.error("Error fetching route:", error.message);
      throw error;
    }
  }

  // Decode polyline to array of coordinates
  decodePolyline(encoded) {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lng / 1e5, lat / 1e5]);
    }

    return points;
  }

  // Check if a location is on the route
  isLocationOnRoute(location, route, thresholdMeters = 50) {
    const routeLine = turf.lineString(route);
    const locationPoint = turf.point([location.lng, location.lat]);
    const distance = turf.pointToLineDistance(locationPoint, routeLine, {
      units: "meters",
    });

    return distance <= thresholdMeters;
  }

  // Public method to check route
  async checkIfLocationIsOnRoute(
    pickup,
    destination,
    location,
    thresholdMeters = 500
  ) {
    const route = await this.getRoutePolyline(pickup, destination);
    return this.isLocationOnRoute(location, route, thresholdMeters);
  }
}

module.exports = RouteLocationChecker;
