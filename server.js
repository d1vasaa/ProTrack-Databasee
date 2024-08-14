const express = require('express');         // Import Express framework
const bodyParser = require('body-parser');  // Import body-parser middleware
const path = require("path");               // Import path library
const fs = require("fs");                   // Import fs library
const app = express();                      // Create an Express application
const port = 3000;                          // Define the port the server will listen on

app.use(bodyParser.json());                 // Use body-parser middleware to parse JSON request bodies
app.use(express.static('public'));          // Serve static files from the 'public' directory

const assist = require('./functions/assist');          // Import functions from assist.js

const dbPath = path.join(__dirname, 'data/database.json');  // Path to the database.json file

// Handle GET requests to retrieve lat & long data
app.get('/data', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        // Handle file read errors
        if (err) {
            res.status(500).send('Error Reading Data; server.js, line 20');
            return;
        }
        const parsedData = JSON.parse(data);  // Parse JSON data from the file
        res.json(parsedData.GPSData);         // Send the GPS data as a JSON response
    });
});

// Handle POST requests to update database.json
app.post('/data', (req, res) => {
  let RD = req.body;  // Received data stored in RD
  const GoSoS = assist.check_if_GPS_or_status_or_skip(RD);  // Check if data is related to GPS/status or should be skipped
  const isCord = assist.check_if_GPS_data_is_valid(RD.lat, RD.long)  // Check if the received data contains valid coordinates
  
  // If the data is related to GPS
  if (GoSoS === "GPS") {
    // If the GPS data is not valid coordinates
    if (!isCord) {
      res.json("Send Proper Coordinates; server.js, line 38");
      return;
    }
    // Read database.json
    fs.readFile(dbPath, 'utf8', (err, data) => {
      // Handle file read errors
      if (err) {
        res.status(500).send("Error Reading Data; server.js, line 45");
        return;
      }
      let originalData = JSON.parse(data);  // Original data from database.json
      let findOD = originalData.GPSData.find(item => item.id === RD.id);  // Find the existing data with the same id

      // If the data exists, update it
      if (findOD) {
        findOD.lat = RD.lat;   // Update latitude
        findOD.long = RD.long; // Update longitude
        
        // Write the updated data back to database.json
        fs.writeFile(dbPath, JSON.stringify(originalData, null, 2), (writeErr) => {
          // Handle file write errors
          if (writeErr) {
            res.status(500).send("Error Updating Data; server.js, line 60");
            return;
          } else {
            console.log("GPS Data Successfully Updated; server.js, line 63");
            res.json(originalData);  // Send the updated data as a JSON response
          }
        });
      }
      // If the data does not exist, add it
      else {
        RD["status"] = "OFF";  // Add status key to the received data
        originalData.GPSData.push(RD);  // Add the new data to the original data

        assist.sortGPSDataById(originalData);  // Sort the GPS data by id

        // Write the new data to database.json
        fs.writeFile(dbPath, JSON.stringify(originalData, null, 2), (writeErr) => {
          // Handle file write errors
          if (writeErr) {
            res.status(500).send("Error Updating Data; server.js, line 79");
            return;
          } else {
            console.log("Data Successfully Added :)");
            res.json(originalData);  // Send the updated data as a JSON response
          }
        });
      }
    });
  }
  // If the data is related to status
  else if (GoSoS === "status") {
    // Read database.json
    fs.readFile(dbPath, 'utf8', (err, data) => {
      // Handle file read errors
      if (err) {
        res.status(500).send("Error Reading Data; server.js, line 95");
        return;
      }
      let originalData = JSON.parse(data);  // Original data from database.json
      let findOD = originalData.GPSData.find(item => item.id === RD.id);  // Find the existing data with the same id

      // If the data exists, update the status
      if (findOD) {
        // Validate the status value
        if (RD["status"] != "ON" && RD["status"] != "OFF") {
          res.json("Upload Data With The Proper Format Please; server.js, line 105");
          return;
        }

        findOD.status = RD.status;  // Update status

        // Write the updated data back to database.json
        fs.writeFile(dbPath, JSON.stringify(originalData, null, 2), (writeErr) => {
            // Handle file write errors
            if (writeErr) {
              res.status(500).send("Error Updating Data; server.js, line 115");
            } else {
              console.log("Status Updated Successfully :)");
              res.json(originalData);  // Send the updated data as a JSON response
            }
        });
      }
    });
  }
  // If the data format is not valid
  else {
    res.json("Upload Data With The Proper Format Please; server.js, line 126");
    return;
  }
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Send the index.html file as a response
});


// Get specific data from database according to the id given
app.get('/data/:id', (req, res) => {
  const id = req.params.id;  // Extract the id from the request parameters
  console.log(`Received ID: ${id}`);
  fs.readFile(dbPath, 'utf8', (err,  data) => {
    // Handle file read errors
    if (err) {
      console.error("Error Getting Data; server.js, line 143");
      return;
    }
    try {
      const originalData = JSON.parse(data);  // Parse the JSON data from the file
      res.json(originalData.GPSData[id-1]);   // Send the specific data as a JSON response
    }
    catch (error) {
      console.error("ID Doesn't Exist; server.js, line 150");  // Handle errors if the id does not exist
    }
  });
})


// Get specific status data from database according to the ID given
app.get('/data/:id/status', (req, res) => {
  const id = req.params.id;
  console.log(`Received ID: ${id}`);
  fs.readFile(dbPath, 'utf8', (err, data) => {
    // Handle file read errors
    if (err) {
      console.error("Error Getting Data; server.js, line 164");  
      return;
    }
    try {
      const originalData = JSON.parse(data);        // Parse the JSON data from the file
      res.json(originalData.GPSData[id-1].status);  // Send the specific data as a JSON response
    }
    catch (error) {
      console.error("ID Doesn't Exist; server.js, line 173");  // Handle errors if the id does not exist
    }
  })
})



// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);  // Log the server start message
});
