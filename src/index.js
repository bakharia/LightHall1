import { Loader } from "@googlemaps/js-api-loader";

// Replace 'YOUR_MAP_API_KEY' with your actual map API key
const MAP_API_KEY = "AIzaSyCWnjCAycZZXGJ7qHJtdAXuxY9zzR3m290";

// Create the API loader instance
const loader = new Loader({
  apiKey: MAP_API_KEY,
  libraries: ["places"]
});

// Initialize the app
function initializeApp() {
  const calculateBtn = document.getElementById("calculateBtn");
  calculateBtn.addEventListener("click", calculateAirDistance);

  const pointAInput = document.getElementById("pointA").querySelector("input");
  const pointBInput = document.getElementById("pointB").querySelector("input");

  // Use the Google Maps Places Autocomplete library
  new google.maps.places.Autocomplete(pointAInput);
  new google.maps.places.Autocomplete(pointBInput);

  //Switch Themes
  // Query for the toggle that is used to change between themes
  const toggle = document.querySelector("#themeBtn");
  const body = document.querySelector("body");

  // Listen for the toggle check/uncheck to toggle the dark class on the <body>
  toggle.addEventListener("ionChange", (ev) => {
    if (ev.detail.checked) {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
  });
}

// Function to convert address to latitude and longitude
async function getCoordinates(point) {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: point }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const result = results[0].geometry.location;
        resolve({
          latitude: result.lat(),
          longitude: result.lng()
        });
      } else {
        alert("Geocoding failed. Please check your input and try again.");
        reject(new Error(`Geocoding failed for ${point}`));
      }
    });
  });
}

// Function to calculate the air distance between two coordinates
function getAirDistance(coordinatesA, coordinatesB) {
  const earthRadiusKm = 6371; // Approximate radius of the Earth in kilometers

  const latDiff = degreesToRadians(
    coordinatesB.latitude - coordinatesA.latitude
  );
  const lonDiff = degreesToRadians(
    coordinatesB.longitude - coordinatesA.longitude
  );

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(degreesToRadians(coordinatesA.latitude)) *
      Math.cos(degreesToRadians(coordinatesB.latitude)) *
      Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return distance;
}

// Function to calculate the air distance between two points
async function calculateAirDistance() {
  const pointAInput = document.getElementById("pointA").querySelector("input");
  const pointBInput = document.getElementById("pointB").querySelector("input");

  const pointA = pointAInput.value.trim();
  const pointB = pointBInput.value.trim();

  // Validate input
  if (!pointA || !pointB) {
    alert("Please enter both points.");
    return;
  }

  // Convert address to latitude and longitude
  const coordinatesA = await getCoordinates(pointA);
  const coordinatesB = await getCoordinates(pointB);

  // Calculate air distance
  const distance = getAirDistance(coordinatesA, coordinatesB);

  // Display the result
  document.getElementById("result").textContent = `Distance: ${distance.toFixed(
    2
  )}km`;
}

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Load the Google Maps API and initialize the app
loader.load().then(() => {
  initializeApp();
});
