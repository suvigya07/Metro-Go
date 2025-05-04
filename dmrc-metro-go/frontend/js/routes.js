// // This file will contain the logic for route calculation
// // For now, it's a placeholder for future implementation

// /**
//  * Metro network graph data structure
//  * Will be populated with actual DMRC data
//  */
// const metroNetwork = {
//     stations: {},
//     connections: []
//   };
  
//   /**
//    * Fare calculation based on distance
//    * @param {number} distanceInKm - Distance in kilometers
//    * @returns {number} - Fare in rupees
//    */
//   function calculateFare(distanceInKm) {
//     // DMRC fare structure (simplified)
//     if (distanceInKm <= 2) return 10;
//     if (distanceInKm <= 5) return 20;
//     if (distanceInKm <= 12) return 30;
//     if (distanceInKm <= 21) return 40;
//     if (distanceInKm <= 32) return 50;
//     return 60; // for distances > 32 km
//   }
  
//   /**
//    * Calculate travel time based on distance
//    * @param {number} distanceInKm - Distance in kilometers
//    * @returns {string} - Time in minutes
//    */
//   function calculateTravelTime(distanceInKm) {
//     // Average metro speed ~33 km/h
//     // Add 30 seconds per station for stoppage time
//     const speedInKmPerMin = 33 / 60;
//     const numberOfStations = Math.ceil(distanceInKm / 1.2); // Approx 1.2 km between stations
//     const movingTime = distanceInKm / speedInKmPerMin;
//     const stoppageTime = numberOfStations * 0.5; // 0.5 minutes per station
    
//     return Math.ceil(movingTime + stoppageTime);
//   }
  
//   /**
//    * Find shortest path using Dijkstra's algorithm
//    * @param {string} startId - Starting station ID
//    * @param {string} endId - Ending station ID
//    * @returns {object} - Route information
//    */
//   function findShortestPath(startId, endId) {
//     // This will be implemented with the actual graph data
//     // For now, it returns placeholder data
    
//     return {
//       path: [startId, /* intermediate stations */, endId],
//       distance: 0, // Will be calculated
//       time: 0      // Will be calculated
//     };
//   }
  
//   // Export functions if using as a module
//   // This is just placeholder for now
//   if (typeof module !== 'undefined' && module.exports) {
//     module.exports = {
//       calculateFare,
//       calculateTravelTime,
//       findShortestPath
//     };
//   }








/**
 * Metro route calculation helper functions
 * This file provides support functions for displaying metro routes
 */

// Line colors according to DMRC line colors
const lineColors = {
    'Red line': '#E11B22',
    'Yellow line': '#FFDE00',
    'Blue line': '#005DAA',
    'Green line': '#00A650',
    'Violet line': '#753BBD',
    'Pink line': '#EC008C',
    'Magenta line': '#EA4C89',
    'Orange line': '#FFA500',
    'Aqua line': '#05B9E2',
    'Grey line': '#ABB1B1',
    // Add more lines as needed
  };
  
  // Get color for a specific metro line
  function getLineColor(line) {
    return lineColors[line] || '#333333'; // Default color if line not found
  }
  
  // Format station display with line color
  function formatStationWithLine(station) {
    if (!station.line) return `<div class="station-item">${station.name}</div>`;
    
    const color = getLineColor(station.line);
    return `
      <div class="station-item" style="border-left: 3px solid ${color}">
        <div class="station-name">${station.name}</div>
        <div class="station-line" style="color: ${color}">${station.line}</div>
      </div>
    `;
  }
  
  // Identify line changes in the route
  function identifyLineChanges(stationsList) {
    const changes = [];
    let currentLine = null;
    
    stationsList.forEach((station, index) => {
      if (station.line && station.line !== currentLine) {
        if (currentLine !== null) {
          changes.push({
            index: index,
            from: currentLine,
            to: station.line,
            station: station.name
          });
        }
        currentLine = station.line;
      }
    });
    
    return changes;
  }
  
  // Generate HTML content for route display with line changes highlighted
  function generateRouteHTML(routeData) {
    const changes = identifyLineChanges(routeData.stations);
    
    // Journey summary
    let html = `
      <h2>Journey Details</h2>
      <div class="journey-details">
        <div class="detail">
          <span>From:</span>
          <strong>${routeData.sourceStation}</strong>
        </div>
        <div class="detail">
          <span>To:</span>
          <strong>${routeData.destinationStation}</strong>
        </div>
        <div class="detail">
          <span>Distance:</span>
          <strong>${routeData.distance}</strong>
        </div>
        <div class="detail">
          <span>Fare:</span>
          <strong>${routeData.fare}</strong>
        </div>
        <div class="detail">
          <span>Travel Time:</span>
          <strong>${routeData.time}</strong>
        </div>
    `;
    
    // Add interchange information if there are line changes
    if (changes.length > 0) {
      html += `
        <div class="detail">
          <span>Interchanges:</span>
          <strong>${changes.length}</strong>
        </div>
      `;
    }
    
    html += `</div>`;
    
    // Stations list
    html += `
      <div class="stations-list">
        <h3>Stations on Route</h3>
        <div id="stations-container">
    `;
    
    // Add stations with interchange highlights
    routeData.stations.forEach((station, index) => {
      // Check if this is an interchange station
      const isInterchange = changes.find(change => change.index === index);
      
      if (isInterchange) {
        const fromColor = getLineColor(isInterchange.from);
        const toColor = getLineColor(isInterchange.to);
        
        html += `
          <div class="station-item interchange" style="border-left: 3px solid ${fromColor}; border-right: 3px solid ${toColor}">
            <div class="station-name">${station.name}</div>
            <div class="interchange-info">
              <span style="color: ${fromColor}">Change from ${isInterchange.from}</span>
              <span class="interchange-arrow">→</span>
              <span style="color: ${toColor}">to ${isInterchange.to}</span>
            </div>
          </div>
        `;
      } else {
        html += formatStationWithLine(station);
      }
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  // If using as a module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getLineColor,
      formatStationWithLine,
      identifyLineChanges,
      generateRouteHTML
    };
  }