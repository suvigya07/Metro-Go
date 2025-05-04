// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Sample metro station data
// const metroStations = [
//   { id: 1, name: 'Rajiv Chowk', lines: ['Yellow', 'Blue'] },
//   { id: 2, name: 'Kashmere Gate', lines: ['Red', 'Yellow', 'Violet'] },
//   { id: 3, name: 'Central Secretariat', lines: ['Yellow', 'Violet'] },
//   // Add more stations as needed
// ];

// // Routes
// app.get('/api/stations', (req, res) => {
//   res.json(metroStations);
// });

// app.get('/api/stations/:id', (req, res) => {
//   const stationId = parseInt(req.params.id);
//   const station = metroStations.find(s => s.id === stationId);
  
//   if (station) {
//     res.json(station);
//   } else {
//     res.status(404).json({ message: 'Station not found' });
//   }
// });

// // Basic route calculation endpoint (placeholder)
// app.post('/api/route', (req, res) => {
//   const { from, to } = req.body;
  
//   // This is where route calculation logic will go
//   // For now, return a sample response
//   res.json({
//     sourceStation: from,
//     destinationStation: to,
//     distance: '15.2 km',
//     fare: '₹30',
//     time: '35 minutes',
//     stations: [
//       { id: 1, name: 'Station A' },
//       { id: 2, name: 'Station B' },
//       { id: 3, name: 'Station C' }
//     ]
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');
// const { parse } = require('csv-parse/sync');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Read and parse the CSV file
// let metroStations = [];
// let metroNetwork = { stations: {}, connections: [] };

// try {
//   const csvFilePath = path.join(__dirname, 'Delhi metro.csv');
//   const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  
//   const records = parse(fileContent, {
//     columns: true,
//     skip_empty_lines: true,
//     trim: true
//   });
  
//   // Process CSV data
//   metroStations = records.map(record => {
//     const station = {
//       id: parseInt(record['ID (Station ID)']),
//       name: record['Station Names'],
//       distanceFromFirst: parseFloat(record['Dist. From First Station(km)']),
//       line: record['Metro Line'],
//       opened: record['Opened(Year)'],
//       layout: record['Layout'],
//       coordinates: {
//         lat: parseFloat(record['Latitude']),
//         lng: parseFloat(record['Longitude'])
//       }
//     };
    
//     // Add station to network graph
//     if (!metroNetwork.stations[station.name]) {
//       metroNetwork.stations[station.name] = {
//         id: station.id,
//         line: station.line,
//         coordinates: station.coordinates
//       };
//     } else {
//       // Handle interchange stations (connecting different lines)
//       if (!metroNetwork.stations[station.name].lines) {
//         metroNetwork.stations[station.name].lines = [metroNetwork.stations[station.name].line];
//         delete metroNetwork.stations[station.name].line;
//       }
      
//       if (metroNetwork.stations[station.name].lines && 
//           !metroNetwork.stations[station.name].lines.includes(station.line)) {
//         metroNetwork.stations[station.name].lines.push(station.line);
//       }
//     }
    
//     return station;
//   });
  
//   // Build connections between stations on the same line
//   const stationsByLine = {};
//   metroStations.forEach(station => {
//     if (!stationsByLine[station.line]) {
//       stationsByLine[station.line] = [];
//     }
//     stationsByLine[station.line].push(station);
//   });
  
//   // Sort stations by distance from first station to get proper sequence
//   Object.keys(stationsByLine).forEach(line => {
//     stationsByLine[line].sort((a, b) => a.distanceFromFirst - b.distanceFromFirst);
    
//     // Create connections between adjacent stations
//     for (let i = 0; i < stationsByLine[line].length - 1; i++) {
//       const from = stationsByLine[line][i];
//       const to = stationsByLine[line][i + 1];
//       const distance = to.distanceFromFirst - from.distanceFromFirst;
      
//       metroNetwork.connections.push({
//         from: from.name,
//         to: to.name,
//         line: line,
//         distance: distance
//       });
      
//       // Add reverse connection too (for bidirectional travel)
//       metroNetwork.connections.push({
//         from: to.name,
//         to: from.name,
//         line: line,
//         distance: distance
//       });
//     }
//   });
  
//   console.log(`Loaded ${metroStations.length} metro stations and ${metroNetwork.connections.length} connections.`);
// } catch (error) {
//   console.error('Error loading metro data:', error);
//   // Fallback to sample data if CSV cannot be loaded
//   metroStations = [
//     { id: 1, name: 'Rajiv Chowk', lines: ['Yellow', 'Blue'] },
//     { id: 2, name: 'Kashmere Gate', lines: ['Red', 'Yellow', 'Violet'] },
//     { id: 3, name: 'Central Secretariat', lines: ['Yellow', 'Violet'] },
//   ];
// }

// // Utility functions for route calculation
// function calculateFare(distanceInKm) {
//   // DMRC fare structure
//   if (distanceInKm <= 2) return 10;
//   if (distanceInKm <= 5) return 20;
//   if (distanceInKm <= 12) return 30;
//   if (distanceInKm <= 21) return 40;
//   if (distanceInKm <= 32) return 50;
//   return 60; // for distances > 32 km
// }

// function calculateTravelTime(distanceInKm) {
//   // Average metro speed ~33 km/h
//   // Add 30 seconds per station for stoppage time
//   const speedInKmPerMin = 33 / 60;
//   const numberOfStations = Math.ceil(distanceInKm / 1.2); // Approx 1.2 km between stations
//   const movingTime = distanceInKm / speedInKmPerMin;
//   const stoppageTime = numberOfStations * 0.5; // 0.5 minutes per station

//   return Math.ceil(movingTime + stoppageTime);
// }

// // Dijkstra's algorithm for finding shortest path
// function findShortestPath(startName, endName) {
//   const stations = Object.keys(metroNetwork.stations);
//   if (!stations.includes(startName) || !stations.includes(endName)) {
//     throw new Error('Station not found');
//   }
  
//   // Initialize distances and previous map
//   const distances = {};
//   const previous = {};
//   const unvisited = new Set(stations);
  
//   stations.forEach(station => {
//     distances[station] = station === startName ? 0 : Infinity;
//   });
  
//   while (unvisited.size > 0) {
//     // Find station with minimum distance
//     let currentStation = null;
//     let minDistance = Infinity;
    
//     for (const station of unvisited) {
//       if (distances[station] < minDistance) {
//         minDistance = distances[station];
//         currentStation = station;
//       }
//     }
    
//     // If we can't find a station or reached destination, break
//     if (currentStation === null || currentStation === endName) break;
    
//     // Remove current station from unvisited
//     unvisited.delete(currentStation);
    
//     // Get all connections from current station
//     const connections = metroNetwork.connections.filter(conn => conn.from === currentStation);
    
//     for (const connection of connections) {
//       const neighbor = connection.to;
//       const distance = distances[currentStation] + connection.distance;
      
//       if (distance < distances[neighbor]) {
//         distances[neighbor] = distance;
//         previous[neighbor] = {
//           station: currentStation,
//           line: connection.line,
//           distance: connection.distance
//         };
//       }
//     }
//   }
  
//   // Reconstruct path
//   const path = [];
//   let current = endName;
//   let totalDistance = 0;
//   let lines = [];
  
//   while (current !== startName) {
//     if (!previous[current]) {
//       // No path found
//       return null;
//     }
    
//     path.unshift({
//       name: current,
//       line: previous[current].line
//     });
    
//     if (!lines.includes(previous[current].line)) {
//       lines.push(previous[current].line);
//     }
    
//     totalDistance += previous[current].distance;
//     current = previous[current].station;
//   }
  
//   // Add start station
//   path.unshift({
//     name: startName,
//     line: path[0] ? path[0].line : null
//   });
  
//   return {
//     path: path,
//     distance: totalDistance,
//     time: calculateTravelTime(totalDistance),
//     fare: calculateFare(totalDistance),
//     lines: lines
//   };
// }

// // Routes
// app.get('/api/stations', (req, res) => {
//   // Get unique stations to handle interchange stations properly
//   const uniqueStations = [];
//   const stationMap = {};
  
//   metroStations.forEach(station => {
//     if (!stationMap[station.name]) {
//       stationMap[station.name] = {
//         id: station.id,
//         name: station.name,
//         lines: [station.line]
//       };
//       uniqueStations.push(stationMap[station.name]);
//     } else {
//       // Add additional line for interchange stations
//       if (!stationMap[station.name].lines.includes(station.line)) {
//         stationMap[station.name].lines.push(station.line);
//       }
//     }
//   });
  
//   res.json(uniqueStations);
// });

// app.get('/api/stations/:id', (req, res) => {
//   const stationId = parseInt(req.params.id);
//   const station = metroStations.find(s => s.id === stationId);

//   if (station) {
//     res.json(station);
//   } else {
//     res.status(404).json({ message: 'Station not found' });
//   }
// });

// // Route calculation endpoint
// app.post('/api/route', (req, res) => {
//   const { from, to } = req.body;
  
//   try {
//     // Get station names from IDs
//     const fromStation = metroStations.find(s => s.id === parseInt(from));
//     const toStation = metroStations.find(s => s.id === parseInt(to));
    
//     if (!fromStation || !toStation) {
//       return res.status(404).json({ message: 'Station not found' });
//     }
    
//     // Calculate route
//     const route = findShortestPath(fromStation.name, toStation.name);
    
//     if (!route) {
//       return res.status(404).json({ message: 'Route not found' });
//     }
    
//     // Format response
//     res.json({
//       sourceStation: fromStation.name,
//       destinationStation: toStation.name,
//       distance: route.distance.toFixed(1) + ' km',
//       fare: '₹' + route.fare,
//       time: route.time + ' minutes',
//       lineChanges: route.lines.length - 1,
//       lines: route.lines,
//       stations: route.path.map((station, index) => ({
//         id: index + 1,
//         name: station.name,
//         line: station.line
//       }))
//     });
//   } catch (error) {
//     console.error('Route calculation error:', error);
//     res.status(500).json({ message: 'Error calculating route' });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Station = require('./models/Station');
const Connection = require('./models/Connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Utility functions for route calculation
function calculateFare(distanceInKm) {
  // DMRC fare structure
  if (distanceInKm <= 2) return 10;
  if (distanceInKm <= 5) return 20;
  if (distanceInKm <= 12) return 30;
  if (distanceInKm <= 21) return 40;
  if (distanceInKm <= 32) return 50;
  return 60; // for distances > 32 km
}

function calculateTravelTime(distanceInKm) {
  // Average metro speed ~33 km/h
  // Add 30 seconds per station for stoppage time
  const speedInKmPerMin = 33 / 60;
  const numberOfStations = Math.ceil(distanceInKm / 1.2); // Approx 1.2 km between stations
  const movingTime = distanceInKm / speedInKmPerMin;
  const stoppageTime = numberOfStations * 0.5; // 0.5 minutes per station

  return Math.ceil(movingTime + stoppageTime);
}

// Dijkstra's algorithm for finding shortest path using database connections
async function findShortestPath(startName, endName) {
  // Get all stations as a list of names
  const allStations = await Station.find({}, 'name').lean();
  const stations = allStations.map(station => station.name);
  
  if (!stations.includes(startName) || !stations.includes(endName)) {
    throw new Error('Station not found');
  }
  
  // Initialize distances and previous map
  const distances = {};
  const previous = {};
  const unvisited = new Set(stations);
  
  stations.forEach(station => {
    distances[station] = station === startName ? 0 : Infinity;
  });
  
  while (unvisited.size > 0) {
    // Find station with minimum distance
    let currentStation = null;
    let minDistance = Infinity;
    
    for (const station of unvisited) {
      if (distances[station] < minDistance) {
        minDistance = distances[station];
        currentStation = station;
      }
    }
    
    // If we can't find a station or reached destination, break
    if (currentStation === null || currentStation === endName) break;
    
    // Remove current station from unvisited
    unvisited.delete(currentStation);
    
    // Get all connections from current station from database
    const connections = await Connection.find({ from: currentStation }).lean();
    
    for (const connection of connections) {
      const neighbor = connection.to;
      const distance = distances[currentStation] + connection.distance;
      
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = {
          station: currentStation,
          line: connection.line,
          distance: connection.distance
        };
      }
    }
  }
  
  // Reconstruct path
  const path = [];
  let current = endName;
  let totalDistance = 0;
  let lines = [];
  
  while (current !== startName) {
    if (!previous[current]) {
      // No path found
      return null;
    }
    
    path.unshift({
      name: current,
      line: previous[current].line
    });
    
    if (!lines.includes(previous[current].line)) {
      lines.push(previous[current].line);
    }
    
    totalDistance += previous[current].distance;
    current = previous[current].station;
  }
  
  // Add start station
  path.unshift({
    name: startName,
    line: path[0] ? path[0].line : null
  });
  
  return {
    path: path,
    distance: totalDistance,
    time: calculateTravelTime(totalDistance),
    fare: calculateFare(totalDistance),
    lines: lines
  };
}

// Routes
app.get('/api/stations', async (req, res) => {
  try {
    // Get all stations from database
    const stations = await Station.find().lean();
    
    // Format for response
    const uniqueStations = stations.map(station => ({
      id: station.stationId,
      name: station.name,
      lines: station.lines
    }));
    
    res.json(uniqueStations);
  } catch (error) {
    console.error('Error getting stations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stations/:id', async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const station = await Station.findOne({ stationId }).lean();

    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    console.error('Error getting station:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route calculation endpoint
app.post('/api/route', async (req, res) => {
  const { from, to } = req.body;
  
  try {
    // Get station names from IDs
    const fromStation = await Station.findOne({ stationId: parseInt(from) }).lean();
    const toStation = await Station.findOne({ stationId: parseInt(to) }).lean();
    
    if (!fromStation || !toStation) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Calculate route
    const route = await findShortestPath(fromStation.name, toStation.name);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // Format response
    res.json({
      sourceStation: fromStation.name,
      destinationStation: toStation.name,
      distance: route.distance.toFixed(1) + ' km',
      fare: '₹' + route.fare,
      time: route.time + ' minutes',
      lineChanges: route.lines.length - 1,
      lines: route.lines,
      stations: route.path.map((station, index) => ({
        id: index + 1,
        name: station.name,
        line: station.line
      }))
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ message: 'Error calculating route' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});