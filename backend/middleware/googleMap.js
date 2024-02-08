const axios = require('axios');

async function searchLocation(locationQuery) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const encodedLocationQuery = encodeURIComponent(locationQuery);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedLocationQuery}&key=${apiKey}`
    );

    // Extract relevant information from the response
    const results = response.data.results.map(result => ({
      name: result.name,
      address: result.formatted_address,
      // Add more fields as needed
    }));

    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = searchLocation;
