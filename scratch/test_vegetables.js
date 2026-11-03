const path = require('path');
require(path.join(__dirname, '..', 'ml-categorizer.js'));

const vegetables = [
  'Bhindi 500g',
  'Aloo pyaaz tamatar 2kg',
  'Palak methi saag fresh',
  'Baingan brinjal',
  'Gobi patta gobi',
  'Lauki tori karela',
  'Adrak lahsun hari mirch',
  'Shimla mirch capsicum',
  'Gajar mooli beetroot',
  'Sabzi Mandi cash transfer',
  'Matar peas 1kg',
  'Mushroom button pack'
];

console.log('\n--- MODEL TEST: INDIAN VEGETABLE NAMES ---');
let pass = 0;
vegetables.forEach(veg => {
  const res = global.mlCategorizeDetailed(veg);
  const ok = res.category === 'Groceries';
  if (ok) pass++;
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} "${veg}" -> [${res.category}] (${(res.confidence * 100).toFixed(1)}%) | Matches: ${res.featuresMatched.join(', ')}`);
});

console.log(`\nResult: ${pass}/${vegetables.length} classified as Groceries`);
