const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'build_dataset.js');
let code = fs.readFileSync(filePath, 'utf8');

const oldGroceryTarget = `    "Origami Soft Facial Tissues", "Fresh Potatoes & Onions 5kg", "Fresh Tomatoes 2kg", "Shimla Apples 1kg",
    "Alphonso Mangoes Box", "Green Vegetables Coriander Palak", "Paneer Malai Block 200g", "Curd Dahi Amul 400g"`;

const indianVegetablesList = `    "Origami Soft Facial Tissues", "Fresh Potatoes & Onions 5kg", "Fresh Tomatoes 2kg", "Shimla Apples 1kg",
    "Alphonso Mangoes Box", "Green Vegetables Coriander Palak", "Paneer Malai Block 200g", "Curd Dahi Amul 400g",
    // Indian Vegetable Names (Hindi, Regional & English)
    "Aloo Potato Fresh", "Pyaaz Onion 1kg", "Tamatar Tomato Red", "Bhindi Lady Finger Okra",
    "Baingan Eggplant Brinjal", "Gobi Cauliflower Fresh", "Patta Gobi Cabbage Green", "Palak Spinach Bunch",
    "Methi Fenugreek Leaves", "Sarson Saag Fresh", "Lauki Bottle Gourd", "Turai Ridge Gourd",
    "Karela Bitter Gourd", "Tinda Apple Gourd", "Parwal Pointed Gourd", "Kundru Ivy Gourd",
    "Shimla Mirch Capsicum", "Hari Mirch Green Chilli", "Adrak Ginger Fresh", "Lahsun Garlic Bulbs",
    "Dhania Coriander Leaves", "Pudina Mint Bunch", "Kari Patta Curry Leaves", "Matar Green Peas",
    "Gajar Carrot Red Winter", "Mooli Radish White", "Chukandar Beetroot", "Shalgam Turnip",
    "Arbi Colocasia Taro Root", "Jimikand Suran Yam", "Kaddoo Pumpkin Yellow", "Sitaphal Pumpkin",
    "Sem Fali Broad Beans", "Gawar Phali Cluster Beans", "French Beans Fresh", "Mushroom Button Pack",
    "Baby Corn Pack", "Sweet Corn Cobs", "Makkai Bhutta Corn", "Kaccha Kela Raw Banana",
    "Kaccha Aam Raw Mango", "Suhana Sabzi Mandi", "Local Sabzi Mandi Purchase", "Vegetable Vendor Sabzi Dukan"`;

const isCRLF = code.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';

code = code.replace(oldGroceryTarget.replace(/\n/g, nl), indianVegetablesList.replace(/\n/g, nl));

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ build_dataset.js enriched with Indian vegetable names (Groceries)!');
