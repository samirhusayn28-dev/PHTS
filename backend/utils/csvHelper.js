const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

function getFilePath(fileName) {
  return path.join(dataDir, fileName);
}

function appendToCSV(fileName, data) {
  const filePath = getFilePath(fileName);

  const headers = Object.keys(data).join(",");
  const values = Object.values(data).join(",");

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers + "\n");
  }

  fs.appendFileSync(filePath, values + "\n");
}

function readCSV(fileName) {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf8").trim();
  if (!content) return [];

  const lines = content.split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });
}

module.exports = {
  appendToCSV,
  readCSV
};
