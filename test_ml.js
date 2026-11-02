/**
 * test_ml.js
 * Quick Interactive Test Runner for the In-Browser ML Categorizer
 * Run with: node test_ml.js
 */

require('./ml-categorizer.js');

const testCases = [
  // 1. Food & Dining
  "Butter Naan Dal Makhani",
  "Diet Coke 300ml can",
  "Zomato Biryani Order",
  "Starbucks Caramel Macchiato",

  // 2. Health & Wellness
  "Colgate toothpaste sensitive",
  "Durex condom air thin",
  "Apollo Pharmacy Dolo 650",
  "Cult.fit gym annual membership",

  // 3. Subscriptions & Entertainment
  "TATA SKY DTH RECHARGE",
  "Netflix monthly premium subscription",
  "Spotify family plan",
  "BookMyShow IMAX movie ticket",

  // 4. Shopping
  "Jockey underwear briefs cotton",
  "Amazon apparel clothing jeans",
  "Decathlon sports running shoes",
  "Boat airdopes bluetooth earbuds",

  // 5. Travel & Transport
  "POS 401289 UBER INDIA RIDES MUMBAI",
  "Ola auto ride central",
  "HPCL petrol fuel pump station",
  "IRCTC train ticket booking",

  // 6. Groceries
  "Blinkit 10 min grocery delivery",
  "Amul butter milk kirana store",
  "Zepto fresh tomatoes & bread",

  // 7. Utilities & Bills
  "BESCOM electricity bill payment",
  "Airtel broadband fiber recharge",
  "Indane gas cylinder refill",

  // 8. Investments & Income
  "UPI/ZERODHA-BROKING-LTD/BLR",
  "Groww mutual fund monthly SIP",
  "Monthly salary credited TCS labs payroll"
];

console.log("=========================================================================================");
console.log("             LEDGER IN-BROWSER MACHINE LEARNING MODEL TEST RUNNER                        ");
console.log(`             Model Info: ${global.ML_MODEL_INFO.accuracy} Accuracy | ${global.ML_MODEL_INFO.vocabSize} Subword Features`);
console.log("=========================================================================================\n");

let passed = 0;
testCases.forEach((text, i) => {
  const result = global.mlCategorizeDetailed(text);
  const confidencePercent = (result.confidence * 100).toFixed(1);
  const features = result.featuresMatched.join(", ");

  console.log(`[#${(i+1).toString().padStart(2, '0')}] "${text}"`);
  console.log(`     └─► Predicted: \x1b[32m${result.category}\x1b[0m (\x1b[36m${confidencePercent}% ML Confidence\x1b[0m)`);
  console.log(`     └─► Subwords:  [${features}]\n`);
  passed++;
});

console.log("=========================================================================================");
console.log(` Tested ${passed}/${testCases.length} transactions through the statistical ML engine.`);
console.log("=========================================================================================");
