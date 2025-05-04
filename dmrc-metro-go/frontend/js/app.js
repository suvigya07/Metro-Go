// // Global variables
// const API_URL = 'http://localhost:3000/api';
// let stations = [];

// // DOM Elements
// const fromStationSelect = document.getElementById('from-station');
// const toStationSelect = document.getElementById('to-station');
// const routeForm = document.getElementById('route-form');
// const resultsContainer = document.getElementById('results');

// // Initialize the application
// document.addEventListener('DOMContentLoaded', init);

// function init() {
//   // Fetch stations from API
//   fetchStations();
  
//   // Set up event listeners
//   routeForm.addEventListener('submit', handleRouteSubmit);
// }

// // Fetch all stations from the API
// async function fetchStations() {
//   try {
//     const response = await fetch(`${API_URL}/stations`);
//     stations = await response.json();
    
//     // Populate dropdown menus
//     populateStationDropdowns();
//   } catch (error) {
//     console.error('Error fetching stations:', error);
//     // Handle error (could show error message to user)
//   }
// }

// // Populate station dropdown menus
// function populateStationDropdowns() {
//   stations.forEach(station => {
//     // Create option elements
//     const fromOption = createStationOption(station);
//     const toOption = createStationOption(station);
    
//     // Append to select elements
//     fromStationSelect.appendChild(fromOption);
//     toStationSelect.appendChild(toOption);
//   });
// }

// // Create station option element
// function createStationOption(station) {
//   const option = document.createElement('option');
//   option.value = station.id;
//   option.textContent = station.name;
//   return option;
// }

// // Handle route form submission
// async function handleRouteSubmit(event) {
//   event.preventDefault();
  
//   const fromStationId = fromStationSelect.value;
//   const toStationId = toStationSelect.value;
  
//   if (!fromStationId || !toStationId) {
//     alert('Please select both origin and destination stations');
//     return;
//   }
  
//   if (fromStationId === toStationId) {
//     alert('Origin and destination stations cannot be the same');
//     return;
//   }
  
//   // Get station names for display
//   const fromStation = stations.find(s => s.id === parseInt(fromStationId));
//   const toStation = stations.find(s => s.id === parseInt(toStationId));
  
//   try {
//     // Call the route API
//     const routeData = await calculateRoute(fromStationId, toStationId);
    
//     // Display the results
//     displayRouteResults(routeData);
//   } catch (error) {
//     console.error('Error calculating route:', error);
//     // Handle error
//   }
// }

// // Call API to calculate route
// async function calculateRoute(fromId, toId) {
//   try {
//     const response = await fetch(`${API_URL}/route`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         from: parseInt(fromId),
//         to: parseInt(toId)
//       })
//     });
    
//     return await response.json();
//   } catch (error) {
//     console.error('API error:', error);
//     throw error;
//   }
// }

// // Display route results
// function displayRouteResults(routeData) {
//   // Make results container visible
//   resultsContainer.classList.add('active');
  
//   // Create HTML for results
//   resultsContainer.innerHTML = `
//     <h2>Journey Details</h2>
//     <div class="journey-details">
//       <div class="detail">
//         <span>From:</span>
//         <strong>${routeData.sourceStation}</strong>
//       </div>
//       <div class="detail">
//         <span>To:</span>
//         <strong>${routeData.destinationStation}</strong>
//       </div>
//       <div class="detail">
//         <span>Distance:</span>
//         <strong>${routeData.distance}</strong>
//       </div>
//       <div class="detail">
//         <span>Fare:</span>
//         <strong>${routeData.fare}</strong>
//       </div>
//       <div class="detail">
//         <span>Travel Time:</span>
//         <strong>${routeData.time}</strong>
//       </div>
//     </div>
    
//     <div class="stations-list">
//       <h3>Stations on Route</h3>
//       <div id="stations-container">
//         ${routeData.stations.map(station => 
//           `<div class="station-item">${station.name}</div>`
//         ).join('')}
//       </div>
//     </div>
//   `;
// }




// Global variables
const API_URL = 'http://localhost:3000/api';
let stations = [];

// DOM Elements
const fromStationSelect = document.getElementById('from-station');
const toStationSelect = document.getElementById('to-station');
const routeForm = document.getElementById('route-form');
const resultsContainer = document.getElementById('results');

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Fetch stations from API
  fetchStations();
  
  // Set up event listeners
  routeForm.addEventListener('submit', handleRouteSubmit);
  
  // Add switch stations button functionality
  const switchButton = document.createElement('button');
  switchButton.type = 'button';
  switchButton.className = 'btn switch-btn';
  switchButton.innerHTML = '↑↓ Switch';
  switchButton.addEventListener('click', switchStations);
  
  // Insert switch button after the from-station select
  fromStationSelect.parentNode.insertAdjacentElement('afterend', switchButton);
  
  // Add additional styles for the switch button
  const style = document.createElement('style');
  style.textContent = `
    .switch-btn {
      background-color: #555;
      margin: 10px 0;
      width: auto !important;
      padding: 8px 15px;
    }
    .interchange-info {
      margin-top: 5px;
      font-size: 0.9em;
    }
    .interchange-arrow {
      margin: 0 5px;
      font-weight: bold;
    }
    .station-line {
      font-size: 0.8em;
      font-weight: bold;
    }
    .station-item.interchange {
      background-color: #f0f0f0;
      border-radius: 4px;
      padding: 12px;
    }
    .loading {
      text-align: center;
      padding: 20px;
    }
  `;
  document.head.appendChild(style);
}

// Fetch all stations from the API
async function fetchStations() {
  try {
    // Show loading state
    fromStationSelect.innerHTML = '<option value="">Loading stations...</option>';
    toStationSelect.innerHTML = '<option value="">Loading stations...</option>';
    
    const response = await fetch(`${API_URL}/stations`);
    stations = await response.json();
    
    // Sort stations alphabetically for easier selection
    stations.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate dropdown menus
    populateStationDropdowns();
  } catch (error) {
    console.error('Error fetching stations:', error);
    fromStationSelect.innerHTML = '<option value="">Error loading stations</option>';
    toStationSelect.innerHTML = '<option value="">Error loading stations</option>';
  }
}

// Populate station dropdown menus
function populateStationDropdowns() {
  // Clear existing options
  fromStationSelect.innerHTML = '<option value="">Select origin station</option>';
  toStationSelect.innerHTML = '<option value="">Select destination station</option>';
  
  stations.forEach(station => {
    // Create option elements
    const fromOption = createStationOption(station);
    const toOption = createStationOption(station);
    
    // Append to select elements
    fromStationSelect.appendChild(fromOption);
    toStationSelect.appendChild(toOption);
  });
}

// Create station option element
function createStationOption(station) {
  const option = document.createElement('option');
  option.value = station.id;
  
  // Display station name with lines for interchange stations
  if (station.lines && station.lines.length > 1) {
    option.textContent = `${station.name} (${station.lines.join(', ')})`;
  } else {
    option.textContent = station.name;
  }
  
  return option;
}

// Switch origin and destination stations
function switchStations() {
  const fromValue = fromStationSelect.value;
  const toValue = toStationSelect.value;
  
  fromStationSelect.value = toValue;
  toStationSelect.value = fromValue;
}

// Handle route form submission
async function handleRouteSubmit(event) {
  event.preventDefault();
  
  const fromStationId = fromStationSelect.value;
  const toStationId = toStationSelect.value;
  
  if (!fromStationId || !toStationId) {
    alert('Please select both origin and destination stations');
    return;
  }
  
  if (fromStationId === toStationId) {
    alert('Origin and destination stations cannot be the same');
    return;
  }
  
  // Show loading state
  resultsContainer.classList.add('active');
  resultsContainer.innerHTML = '<div class="loading">Calculating route...</div>';
  
  try {
    // Call the route API
    const routeData = await calculateRoute(fromStationId, toStationId);
    
    // Display the results
    displayRouteResults(routeData);
  } catch (error) {
    console.error('Error calculating route:', error);
    resultsContainer.innerHTML = `
      <div class="error">
        <h3>Error calculating route</h3>
        <p>Sorry, we couldn't calculate a route between these stations.</p>
        <p>Error: ${error.message || 'Unknown error'}</p>
      </div>
    `;
  }
}

// Call API to calculate route
async function calculateRoute(fromId, toId) {
  try {
    const response = await fetch(`${API_URL}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: parseInt(fromId),
        to: parseInt(toId)
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to calculate route');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// Display route results
function displayRouteResults(routeData) {
  // Make results container visible
  resultsContainer.classList.add('active');
  
  // Use the generateRouteHTML function from routes.js
  resultsContainer.innerHTML = generateRouteHTML(routeData);
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}