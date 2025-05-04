const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Station = require('../models/Station');
const Connection = require('../models/Connection');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to import data from CSV
async function importMetroData() {
  try {
    // Check if data already exists
    const stationCount = await Station.countDocuments();
    const connectionCount = await Connection.countDocuments();
    
    if (stationCount > 0 || connectionCount > 0) {
      console.log('Database already has data. Skipping import.');
      console.log(`Found ${stationCount} stations and ${connectionCount} connections`);
      mongoose.disconnect();
      return;
    }
    
    console.log('Starting data import...');
    
    // Read and parse CSV file
    const csvFilePath = path.join(__dirname, '..', 'Delhi metro.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Parsed ${records.length} records from CSV`);
    
    // Process stations first
    const stationMap = {};
    const stationsToInsert = [];
    
    records.forEach(record => {
      const stationName = record['Station Names'];
      
      if (!stationMap[stationName]) {
        stationMap[stationName] = {
          stationId: parseInt(record['ID (Station ID)']),
          name: stationName,
          lines: [record['Metro Line']],
          distanceFromFirst: parseFloat(record['Dist. From First Station(km)']),
          coordinates: {
            lat: parseFloat(record['Latitude']),
            lng: parseFloat(record['Longitude'])
          },
          opened: record['Opened(Year)'],
          layout: record['Layout']
        };
      } else if (!stationMap[stationName].lines.includes(record['Metro Line'])) {
        // Add additional line for interchange stations
        stationMap[stationName].lines.push(record['Metro Line']);
      }
    });
    
    // Convert map to array of station objects
    for (const [name, station] of Object.entries(stationMap)) {
      stationsToInsert.push(station);
    }
    
    // Insert stations into database
    await Station.insertMany(stationsToInsert);
    console.log(`Inserted ${stationsToInsert.length} stations into database`);
    
    // Process connections
    const stationsByLine = {};
    records.forEach(record => {
      const line = record['Metro Line'];
      if (!stationsByLine[line]) {
        stationsByLine[line] = [];
      }
      stationsByLine[line].push({
        name: record['Station Names'],
        distanceFromFirst: parseFloat(record['Dist. From First Station(km)'])
      });
    });
    
    // Sort stations by distance from first station to get proper sequence
    const connectionsToInsert = [];
    Object.keys(stationsByLine).forEach(line => {
      stationsByLine[line].sort((a, b) => a.distanceFromFirst - b.distanceFromFirst);
      
      // Create connections between adjacent stations
      for (let i = 0; i < stationsByLine[line].length - 1; i++) {
        const from = stationsByLine[line][i];
        const to = stationsByLine[line][i + 1];
        const distance = to.distanceFromFirst - from.distanceFromFirst;
        
        // Forward connection
        connectionsToInsert.push({
          from: from.name,
          to: to.name,
          line: line,
          distance: distance
        });
        
        // Reverse connection
        connectionsToInsert.push({
          from: to.name,
          to: from.name,
          line: line,
          distance: distance
        });
      }
    });
    
    // Insert connections into database
    await Connection.insertMany(connectionsToInsert);
    console.log(`Inserted ${connectionsToInsert.length} connections into database`);
    
    console.log('Data import complete!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the import
importMetroData();