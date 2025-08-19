const axios = require("axios");
const turf = require("@turf/turf");

class RouteLocationChecker {
  constructor() {
    this.graphhopperUrl = "http://localhost:8989/route";  // URL for GraphHopper
  }

  // Fetch route polyline from GraphHopper
  async getRoutePolyline(pickup, destination) {
    try {
      // const response = await axios.get(this.graphhopperUrl, {
      //   params: {
      //     point: `${pickup.lat},${pickup.lng}`,
      //     point: `${destination.lat},${destination.lng}`,
      //     vehicle: "car",
      //     instructions: true,
      //     type: "json",
      //   },
      // });

      // const url = `http://127.0.0.1:8989/route?point=${pickup.lng},${pickup.lat}&point=${destination.lng},${destination.lat}&profile=car&instructions=true&type=json`
      const url = `http://127.0.0.1:8989/route?point=${pickup.lat},${pickup.lng}&point=${destination.lat},${destination.lng}&profile=car&instructions=true&type=json`
      const response = await axios.get(url);
      console.log(response);
      

      if (response.data.paths.length === 0) {
        throw new Error("No routes found");
      }

      // Decode the polyline from the response
      const polyline = response.data.paths[0].points;
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
