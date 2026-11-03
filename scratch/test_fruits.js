const path = require('path');
require(path.join(__dirname, '..', 'ml-categorizer.js'));

const fruitTests = [
  "Alphonso Mango 1 dozen",
  "Kashmiri Seb Apple 1kg",
  "Robusta Kela Banana 1 dozen",
  "Fresh Santara Nagpur Oranges",
  "Mosambi sweet lime 1kg",
  "Seedless Kala Angoor Black Grapes",
  "Tarbooz Watermelon 3kg",
  "Kharbooza Muskmelon sweet",
  "Papita Papaya ripe 1kg",
  "Allahabad Amrood Guava",
  "Ruby Anaar Pomegranate pack",
  "Cheeku Chikoo 500g",
  "Ananas Pineapple fresh cut",
  "Mahabaleshwar Strawberry box",
  "Zespri Kiwi fruit 3 pack",
  "Pink Dragon fruit fresh",
  "Hass Avocado ripe",
  "Pani wala Nariyal coconut tender water",
  "Shahi Litchi Lychee 500g",
  "Fresh Custard Apple Sharifa Sitaphal"
];

console.log("=== FRUIT CLASSIFICATION TEST RESULTS ===");
let passed = 0;
fruitTests.forEach(test => {
  const result = global.mlCategorizeDetailed(test);
  const isGroceries = result.category === "Groceries";
  if (isGroceries) passed++;
  const icon = isGroceries ? "✅" : "❌";
  console.log(`${icon} "${test}" -> [${result.category}] (${(result.confidence * 100).toFixed(1)}%) | Matches: ${result.featuresMatched.slice(0, 5).join(', ')}`);
});

console.log(`\nResult: ${passed}/${fruitTests.length} classified as Groceries`);
