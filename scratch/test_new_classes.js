const path = require('path');
require(path.join(__dirname, '..', 'ml-categorizer.js'));

const queries = [
  'Martial arts class',
  'Tuna',
  'Tuna fish steak',
  'Canned Tuna in oil',
  'Karate training monthly fee',
  'Taekwondo belt class',
  'Brazilian Jiu Jitsu academy',
  'Muay Thai kickboxing gym',
  'MMA training session',
  'Spicy tuna sushi roll'
];

console.log('\n--- MODEL TEST FOR NEW ENTITIES ---');
queries.forEach(q => {
  const res = global.mlCategorizeDetailed(q);
  console.log(`"${q}" -> Category: [${res.category}] (Confidence: ${(res.confidence * 100).toFixed(1)}%) | Matches: ${res.featuresMatched.join(', ')}`);
});
