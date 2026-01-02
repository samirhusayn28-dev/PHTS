const fs = require("fs");
const path = require("path");

/**
 * CSV file ka absolute path return karta hai
 */
function getCSVPath(fileName) {
  return path.join(__dirname, "..", "data", fileName);
}

/**
 * CSV file mein ek new row append karta hai
 * @param {string} fileName - e.g. "vitals.csv"
 * @param {object} data - key:value pairs matching CSV headers
 */
function appendToCSV(fileName, data) {
  return new Promise((resolve, reject) => {
    const filePath = getCSVPath(fileName);

    fs.readFile(filePath, "utf8", (err, content) => {
      if (err) {
        return reject("CSV file not found: " + fileName);
      }

      const lines = content.trim().split("\n");
      const headers = lines[0].split(",");

      // values ko header order mein arrange karo
      const row = headers.map(h => data[h] ?? "").join(",");

      fs.appendFile(filePath, "\n" + row, err => {
        if (err) return reject("Unable to write to CSV");
        resolve(true);
      });
    });
  });
}

/**
 * CSV file ka saara data read karta hai
 * @param {string} fileName
 */
function readCSV(fileName) {
  return new Promise((resolve, reject) => {
    const filePath = getCSVPath(fileName);

    fs.readFile(filePath, "utf8", (err, content) => {
      if (err) return reject("CSV file not found");

      const lines = content.trim().split("\n");
      const headers = lines[0].split(",");

      const records = lines.slice(1).map(line => {
        const values = line.split(",");
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });

      resolve(records);
    });
  });
}

module.exports = {
  appendToCSV,
  readCSV
};
