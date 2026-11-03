const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'build_dataset.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add tuna and seafood samples into "Food & Dining"
const oldFoodSlice = `    "Butter Naan Dal Makhani", "Paneer Tikka Roll", "Chicken Biryani", "Haldiram Sweets",`;
const newFoodSlice = `    "Butter Naan Dal Makhani", "Paneer Tikka Roll", "Chicken Biryani", "Haldiram Sweets",
    "Canned Tuna Fish", "Fresh Tuna Steak", "Tuna Salad Sandwich", "Spicy Tuna Roll",
    "Tuna Flakes in Oil", "Grilled Tuna Fillet", "Smoked Salmon & Tuna", "Seafood Platter",
    "Prawns Fish Market", "Crab Masala Curry",`;

// 2. Add martial arts classes into "Health & Wellness"
const oldHealthSlice = `    "Gold's Gym Annual Pass", "Yoga Classes Monthly Fee", "Dolo 650 Paracetamol Strip", "Crocin Pain Relief",`;
const newHealthSlice = `    "Gold's Gym Annual Pass", "Yoga Classes Monthly Fee", "Dolo 650 Paracetamol Strip", "Crocin Pain Relief",
    "Martial Arts Academy", "Martial Arts Class Monthly", "Karate Training Dojang", "Taekwondo Belt Class",
    "Judo Martial Arts Fee", "Brazilian Jiu Jitsu BJJ", "Muay Thai Boxing Gym", "MMA Mixed Martial Arts",
    "Kickboxing Fitness Training", "Kung Fu Academy Fee", "Boxing Club Sparring", "Martial Arts Uniform Gi",`;

// 3. Add canned/fresh tuna & groceries
const oldGrocerySlice = `    "Britannia Cheese Slices", "Farm Fresh Eggs Tray", "Modern Brown Bread Loaf", "Aashirvaad Shudh Sharbati Atta",`;
const newGrocerySlice = `    "Britannia Cheese Slices", "Farm Fresh Eggs Tray", "Modern Brown Bread Loaf", "Aashirvaad Shudh Sharbati Atta",
    "Tuna Can Grocery", "Canned Tuna Fish 180g", "Tuna in Brine Tin", "Frozen Fish Fillet",`;

const isCRLF = code.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';

code = code.replace(oldFoodSlice.replace(/\n/g, nl), newFoodSlice.replace(/\n/g, nl));
code = code.replace(oldHealthSlice.replace(/\n/g, nl), newHealthSlice.replace(/\n/g, nl));
code = code.replace(oldGrocerySlice.replace(/\n/g, nl), newGrocerySlice.replace(/\n/g, nl));

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ build_dataset.js enriched with Martial Arts, Tuna, and Seafood training tokens!');
