const express = require("express");
const cassandra = require("cassandra-driver");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const app = express();
const xlsx = require("xlsx");
const { log } = require("console");
const NodeCache = require("node-cache");
const cors = require("cors"); 
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "crud_keyspace",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: "*"
    }
)); 
app.get("/", (req, res) => {
  res.send("Welcome to the CRUD API");
});
// Multer configuration for handling file uploads
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Read the uploaded file from its path
  const workbook = xlsx.readFile(req.file.path);
  // console.log(workbook);
  // Assuming the first sheet in the workbook is the one you want to convert
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // console.log(sheet);
  // Convert sheet to JSON
  const pincodeMerchantMap = {};

  const jsonData = xlsx.utils.sheet_to_json(sheet);
  jsonData.forEach(merchant => {
    const merchantName = merchant["Merchant Name"];
    delete merchant["Merchant name"]; // Remove the merchant name key from the object

    // Iterate over each pincode for the current merchant

    Object.entries(merchant).forEach(([pincode, availability]) => {
      // If the pincode is not in the map, initialize it with an empty set
      if (!pincodeMerchantMap[pincode]) {
        pincodeMerchantMap[pincode] = new Set();
      } 

      // console.log(pincode, (availability === 1), merchant["Merchant Name"]);
      // If the merchant is available at this pincode, add it to the set
      if (availability === 1) {
        pincodeMerchantMap[pincode].add(merchantName);
      }
    });
  });
  try {

    await Promise.all(
      Object.entries(pincodeMerchantMap).map(([pincode, merchants]) => {
        const merchantList = Array.from(merchants).join(", ");
        console.log(`Pincode: ${pincode}, Merchants: ${merchantList}`);
        return new Promise((resolve, reject) => {
          client.execute(
            "INSERT INTO merchants (pincode, merchants) VALUES (?, ?)",
            [pincode, merchants],
        
            (err, result) => {
              if (err) {
                console.error("Error inserting data into database:", err);
                reject(err);
              } else {
                console.log("Data inserted successfully:", result);
                resolve(result);
              }
            }
          );
        });
      })
    );

    res.status(201).send("Merchants added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding merchants");
  } finally {
    // Delete the uploaded file after reading it
    fs.unlinkSync(req.file.path);
  }

  res.json(jsonData);
});
// Create
app.post("/merchant", async (req, res) => {
  const { pincode, merchants } = req.body;
  try {
    await client.execute(
      "INSERT INTO merchants (pincode, merchants) VALUES (?, ?)",
      [pincode, merchants]
    );
    res.status(201).send("Merchant added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding merchant");
  }
});
const cache = new NodeCache();
// Read
app.get("/merchant/:pincode", async (req, res) => {
  const pincode = req.params.pincode;
  try {
    const cachedData = cache.get(pincode);
    if (cachedData) {
      return res.json(cachedData);
    }
    let result = await client.execute(
      "SELECT merchants FROM merchants WHERE pincode = ?",
      [pincode]
    );
     result=result.rows;
     console.log(result[0]);
    if (result[0].rowLength === 0) {
      res.status(404).send("No merchants found for this pincode");
    } else {

      res.json(result[0].merchants);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving merchants");
  }
});

// Update
app.put("/merchant/:pincode", async (req, res) => {
  const pincode = req.params.pincode;
  const merchants = req.body.merchants;
  try {

    await client.execute(
      "UPDATE merchants SET merchants = ? WHERE pincode = ?",
      [merchants, pincode]
    );
    res.send("Merchants updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating merchants");
  }
});

// Delete
app.delete("/merchant/:pincode", async (req, res) => {
  const pincode = req.params.pincode;
  try {
    await client.execute("DELETE FROM merchants WHERE pincode = ?", [pincode]);
    res.send("Merchants deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting merchants");
  }
});

// Create a POST endpoint to add merchant name in front of pincode
app.post("/add-merchant", async (req, res) => {
  const { merchantName, pincodeList } = req.body;
  console.log(merchantName, pincodeList);
  try {
    // Iterate through the list of pin codes
    await Promise.all(
      pincodeList.map(async (pincode) => {
        try {
          // Check if the pincode exists in the database
          const existingResult = await client.execute(
            "SELECT merchants FROM merchants WHERE pincode = ?",
            [pincode]
          );

          let merchants = [];
          // If the pincode exists, update the merchants list
          if (existingResult.rowLength > 0) {
            merchants = existingResult.rows[0].merchants;
            // Check if the merchant name is already present for this pincode
            if (!merchants.includes(merchantName)) {
              merchants.push(merchantName);
            }
            await client.execute(
              "UPDATE merchants SET merchants = ? WHERE pincode = ?",
              [merchants, pincode]
            );
          } else {
            // If the pincode doesn't exist, insert a new row with the pincode and merchant name
            await client.execute(
              "INSERT INTO merchants (pincode, merchants) VALUES (?, ?)",
              [pincode, [merchantName]]
            );
          }
        } catch (error) {
          console.error(
            `Error processing pincode ${pincode} for merchant ${merchantName}:`,
            error
          );
        }
      })
    );

    res.status(201).send("Merchant added successfully to pin codes");
  } catch (error) {
    console.error("Error adding merchant to pin codes:", error);
    res.status(500).send("Error adding merchant to pin codes");
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
