const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'build_dataset.js');
let code = fs.readFileSync(filePath, 'utf8');

const targetStr = `"Bhindi Lady Finger Okra",`;
const reinforcedBhindi = `"Bhindi Lady Finger Okra", "Fresh Bhindi Sabzi", "Bhindi 500g Fresh", "Bhindi Okra Green 1kg", "Taza Bhindi Sabzi Mandi", "Bhindi Tori Karela Sabzi",`;

code = code.replace(targetStr, reinforcedBhindi);
fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ Reinforced Bhindi grocery variations in build_dataset.js');
