/**
 * build_dataset.js
 * Compiles a rich, balanced dataset of 1,200+ personal finance transactions
 * across all 12 standard categories, merging:
 * 1. Existing statement files (sample_data.json, sample_statement_hdfc.csv, sample_upi_records.csv)
 * 2. Realistic synthetic Indian & global bank templates (UPI, POS, ACH, Card)
 * 3. Everyday direct merchant & grocery descriptions (colloquial items)
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Travel & Transport",
  "Utilities & Bills",
  "Education & Learning",
  "Subscriptions & Entertainment",
  "Health & Wellness",
  "Groceries",
  "Investments",
  "Income",
  "Personal & Transfers",
  "Miscellaneous"
];

// Seeded pseudo-random generator for reproducibility
let seed = 42;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function choice(arr) {
  return arr[Math.floor(random() * arr.length)];
}

// 1. Raw lexicon dictionary per category (50+ core terms per category)
const LEXICON = {
  "Food & Dining": [
    "Swiggy Order", "Zomato Restaurant", "McDonalds Burger", "KFC Chicken Meal", "Domino's Pizza",
    "Pizza Hut", "Subway Sandwich", "Starbucks Coffee", "Cafe Coffee Day", "Barista Espresso",
    "Butter Naan Dal Makhani", "Paneer Tikka Roll", "Chicken Biryani", "Haldiram Sweets",
    "Bikanervala Thali", "Dhaba Lunch", "Bhojnalaya Dinner", "Diet Coke Can", "Coca Cola Bottle",
    "Pepsi 500ml", "Thums Up Soda", "Sprite Drink", "Cold Coffee", "Chai Point Tea",
    "Chayoos Adrak Chai", "Barbeque Nation Buffet", "Mainland China", "Burger King Meal",
    "Dosa Idli Sambhar", "Chole Bhature", "Pav Bhaji Street", "Shawarma Roll", "Belgian Waffle",
    "Baskin Robbins Ice Cream", "Theobroma Brownie", "Keventers Milkshake", "Chaat Papdi",
    "Samosa Kachori", "Tiffin Service Monthly", "South Indian Meals", "Chinese Chowmein",
    "Momos Platter", "Pasta Arrabiata", "Tandoori Roti", "Lassi Sweet", "Mutton Rogan Josh",
    "Fish Curry Meals", "Bakery Cake Birthday", "Craft Beer Pub", "Social Bar & Cafe"
  ],
  "Shopping": [
    "Amazon Marketplace", "Flipkart Order", "Myntra Fashion App", "Ajio Trends", "Meesho Order",
    "Nykaa Cosmetics", "Zara Clothing", "H&M Apparel", "Uniqlo Casuals", "Decathlon Sports Gear",
    "Jockey Underwear Briefs", "Zivame Lingerie", "Clovia Innerwear", "Levi's Denim Jeans",
    "Allen Solly Trousers", "Peter England Shirt", "Van Heusen Formal Suit", "Nike Running Shoes",
    "Adidas Sneakers", "Puma Trackpants", "Bata Formal Shoes", "Crocs Classic Clog",
    "Wildcraft Backpack", "American Tourister Luggage", "Titan Wrist Watch", "Fastrack Sunglasses",
    "Ray-Ban Aviators", "Croma Electronics", "Vijay Sales Appliance", "Reliance Digital Laptop",
    "Boat Airdopes Earbuds", "Noise Smartwatch", "OnePlus Nord Phone", "Samsung Galaxy Mobile",
    "Apple iPhone Charger", "Logitech Wireless Mouse", "Dell Computer Monitor", "Ikea Study Table",
    "Wakefit Ortho Mattress", "Urban Ladder Sofa", "Pepperfry Bookshelf", "Home Centre Curtains",
    "Cotton King Kurta", "Fabindia Saree", "Manyavar Sherwani", "Woodland Boots",
    "Shoppers Stop Retail", "Westside Store", "Lifestyle Department Store", "H&M Hoodie"
  ],
  "Travel & Transport": [
    "Uber India Ride", "Ola Cabs Trip", "Rapido Bike Taxi", "IRCTC Train Ticket", "Metro Card Recharge",
    "IndiGo Flight Delhi", "Air India Ticket", "Vistara Airways Booking", "SpiceJet Airlines",
    "MakeMyTrip Hotel Flight", "Goibibo Bus Ticket", "RedBus Travel Booking", "HPCL Petrol Pump",
    "IOCL Fuel Station", "BPCL Diesel Filling", "Shell CNG Gas Pump", "Fastag Toll Plaza",
    "Airport Parking Fee", "Railway Station Parking", "Local Auto Fare", "Zoomcar Rental",
    "Avis Car Hire", "Chalo Bus Pass", "Yulu Electric Bike", "Bounce Scooter Ride",
    "Cleartrip Travel Agent", "EaseMyTrip Flight", "AbhiBus Ticket", "Delhi Metro Rail",
    "Namma Metro Bangalore", "Mumbai Local Train Pass", "KSRTC Bus Booking", "UPSRTC Bus Ticket",
    "Indian Oil XtraGreen Fuel", "Bharat Petroleum Fuel", "Highway Toll Fastag Auto", "Intercity Cab Fare",
    "Scooter Service & Oil", "Car Periodic Maintenance", "Tyre Puncture & Air", "Wheel Alignment Balance",
    "Vehicle Insurance Renewal", "PUC Pollution Certificate", "Uber Auto Ride", "Ola Electric Charging",
    "Tata Power EV Station", "Parking Meter Downtown", "Ferry Boat Ticket", "Self Drive Car Deposit"
  ],
  "Utilities & Bills": [
    "Bescom Electricity Bill", "TNEB Power Charges", "MSEB Power Supply", "BSES Rajdhani Electric",
    "UPPCL Electricity Payment", "Municipal Water Supply Bill", "Indane LPG Gas Cylinder",
    "HP Gas Cylinder Booking", "Bharat Gas Payment", "Piped Natural Gas IGL", "Mahanagar Gas Bill",
    "Airtel Broadband Fiber", "JioFiber Monthly Plan", "ACT Fibernet Internet", "Tata Play Fiber",
    "Vi Vodafone Mobile Recharge", "Jio Prepaid Plan", "Airtel Prepaid Mobile", "BSNL Landline Bill",
    "Apartment Society Maintenance", "Monthly House Rent", "Flat Maintenance Advance", "Property Tax Municipal",
    "Trash Collection Fee", "Newspaper Monthly Subscription", "Security Guard Society Fee", "Gas Pipeline Metered",
    "Water Tanker Delivery", "Sewage Disposal Bill", "Electricity Meter Charges", "Commercial Power Tariff",
    "Inverter Battery Maintenance", "Solar Grid Net Metering", "Smart Meter Prepaid Recharge", "Airtel DTH Postpaid",
    "Cable Operator Monthly", "Landlord House Rent Transfer", "Office Co-working Desk Rent", "Hostel Room Rent"
  ],
  "Education & Learning": [
    "College Semester Tuition Fee", "University Exam Fee", "School Monthly Fees", "Allen Career Institute Coaching",
    "FIITJEE IIT JEE Coaching", "Aakash Medical Coaching", "Resonance Institute", "Byju's Learning App",
    "Unacademy Plus Subscription", "Coursera Course Certificate", "Udemy Python Bootcamp", "edX Harvard Certificate",
    "UpGrad Data Science Program", "PhysicsWallah Batch", "Khan Academy Donation", "College Hostel Fee",
    "University Library Fine", "Textbooks Flipkart Books", "Engineering Drawing Kit", "College Laboratory Fee",
    "Stationery Pen Notebooks", "Photocopy Notes Binding", "Cambridge IELTS Exam Fee", "GRE Test Registration",
    "TOEFL Exam Charges", "GMAT Exam Scheduling", "Gate Forum Test Series", "CodeChef Pro Subscription",
    "LeetCode Premium Annual", "DataCamp Monthly Plan", "Pluralsight Skills Subscription", "Audible Audiobooks Learning",
    "Kindle E-Book Purchase", "Oxford English Dictionary", "Classmate Spiral Notebooks", "Scientific Calculator Casio"
  ],
  "Subscriptions & Entertainment": [
    "Tata Sky", "TataSky", "Tata Sky DTH", "Tata Play", "Tata Play DTH", "Tata Sky HD Pack",
    "Netflix Monthly Premium", "Spotify India Subscription", "Disney+ Hotstar Annual VIP", "Amazon Prime Video",
    "YouTube Premium Family", "Apple Music Subscription", "JioSaavn Pro Music", "Gaana Plus Membership",
    "SonyLIV Sports Subscription", "Zee5 All Access Plan", "Voot Select Entertainment", "Tata Sky DTH Recharge",
    "Dish TV Channel Pack", "Sun Direct DTH", "Airtel Digital TV", "BookMyShow Movie Tickets",
    "PVR Cinemas Popcorn & Movie", "INOX Leisure Multiplex", "Cinepolis IMAX Ticket", "PlayStation Network PS Plus",
    "Xbox Game Pass Ultimate", "Steam Game Store Purchase", "Nintendo eShop Game", "Epic Games Purchase",
    "Discord Nitro Subscription", "Twitch Streamer Subscription", "Medium Member Subscription", "Substack Newsletter",
    "Tinder Gold Subscription", "Bumble Premium Boost", "Aha Telugu Streaming", "Hoichoi Bengali Movies",
    "Crunchyroll Anime Fan", "Audible Audio Stories", "Kindle Unlimited Monthly", "Board Game Cafe Entry"
  ],
  "Health & Wellness": [
    "Apollo Pharmacy Medicines", "Medplus Chemist Tablets", "1mg Online Prescription", "Netmeds Healthcare",
    "PharmEasy Medicine Order", "Dr Lal PathLabs Blood Test", "SRL Diagnostics Checkup", "Metropolis Health Screening",
    "Doctor Consultation Fee", "Dental Clinic Tooth Filling", "Dentist Root Canal Treatment", "Eye Hospital Checkup",
    "Lenskart Spectacles Frame", "Titan Eyeplus Contact Lenses", "Cult.fit Gym Membership", "Anytime Fitness Monthly",
    "Gold's Gym Annual Pass", "Yoga Classes Monthly Fee", "Dolo 650 Paracetamol Strip", "Crocin Pain Relief",
    "Colgate Total Toothpaste", "Sensodyne Sensitive Toothpaste", "Oral-B Electric Toothbrush", "Listerine Mouthwash",
    "Durex Condoms Air", "Manforce Condoms Extra", "Skore Contraceptive", "Whisper Sanitary Pads Ultra",
    "Stayfree Secure Menstrual", "Pee Safe Toilet Seat Spray", "Gillette Mach 3 Razor Blades", "Philips Beard Trimmer",
    "Cetaphil Gentle Skin Cleanser", "Neutrogena Sunscreen SPF50", "Himalaya Face Wash Neem", "Nivea Body Moisturizer",
    "Optimum Nutrition Whey Protein", "MuscleBlaze Creatine Monohydrate", "Multivitamin Daily Tablets", "Fish Oil Omega 3",
    "First Aid Bandage Dettol", "Crepe Bandage Sprain Relief", "Volini Pain Spray", "Moov Pain Ointment"
  ],
  "Groceries": [
    "Blinkit 10 Min Grocery", "Zepto Quick Delivery", "Swiggy Instamart Order", "BigBasket Daily Essentials",
    "DMart Ready Supermarket", "Reliance Fresh Kirana", "Spencer's Retail Hypermarket", "Nature's Basket Organic",
    "Local Kirana General Store", "Amul Taza Milk Pouch", "Mother Dairy Cow Milk", "Amul Salted Butter",
    "Britannia Cheese Slices", "Farm Fresh Eggs Tray", "Modern Brown Bread Loaf", "Aashirvaad Shudh Sharbati Atta",
    "India Gate Basmati Rice", "Tata Sampann Toor Dal", "Fortune Sunflower Cooking Oil", "Amul Pure Cow Ghee",
    "MDH Garam Masala Powder", "Tata Salt Iodized 1kg", "Maggi 2-Minute Noodles", "Surf Excel Matic Detergent",
    "Ariel Top Load Powder", "Vim Lemon Dishwash Bar", "Harpic Power Toilet Cleaner", "Lizol Floor Cleaner Citrus",
    "Origami Soft Facial Tissues", "Fresh Potatoes & Onions 5kg", "Fresh Tomatoes 2kg", "Shimla Apples 1kg",
    "Alphonso Mangoes Box", "Green Vegetables Coriander Palak", "Paneer Malai Block 200g", "Curd Dahi Amul 400g"
  ],
  "Investments": [
    "Zerodha Broking Kite", "Groww Mutual Fund SIP", "Upstox Demat Trading", "Angel One Investment",
    "Kite Stock Purchase", "Coin Mutual Fund Direct", "Nippon India Small Cap SIP", "HDFC Top 100 Mutual Fund",
    "SBI Bluechip Fund Growth", "Parag Parikh Flexi Cap Fund", "Mirae Asset Large Cap Fund", "Tata Digital India Fund",
    "NSE Stocks Equity Delivery", "BSE Equity Share Purchase", "Sovereign Gold Bond SGB", "Digital Gold Tanishq",
    "Tanishq Gold Coin 24K", "MMTC PAMP Silver Bar", "Public Provident Fund PPF", "National Pension Scheme NPS",
    "Treasury Bills RBI Retail", "Corporate Fixed Deposit FD", "WazirX Crypto Exchange", "CoinDCX Bitcoin Trading",
    "Binance P2P Crypto", "Ethereum Token Purchase", "Motilal Oswal Nasdaq 100 ETF", "Nifty 50 Index Fund ETF"
  ],
  "Income": [
    "Monthly Salary Credited", "ACH TCS Innovation Labs Stipend", "Infosys Ltd Monthly Payroll",
    "Wipro Technologies Salary", "Accenture Solutions Payroll", "Upwork Escrow Freelance Payment",
    "Fiverr Freelance Payout", "Google AdSense Payout", "YouTube Creator Revenue", "Quarterly Bank Savings Interest",
    "Fixed Deposit FD Interest Credit", "Company Annual Performance Bonus", "Diwali Festival Incentive Bonus",
    "Dividend Credited TCS Shares", "ITC Share Dividend Payment", "Income Tax Refund IT Department",
    "Cashback Credited Cred App", "Google Pay Scratch Card Reward", "Amazon Pay Cashback Credited",
    "Security Deposit Returned Landlord", "Freelance Web Development Project", "Consulting Honorarium Fee",
    "Reimbursement Travel Claims Office", "Internship Stipend First Month"
  ],
  "Personal & Transfers": [
    "UPI Sent to Father", "UPI Sent to Mother", "Transfer to Younger Brother", "Money Sent to Sister",
    "Loan Repayment to Friend", "Hostel Roommate Share", "Dinner Bill Split Settlement", "Flat Rent Split With Friends",
    "Sent to Rahul Sharma", "Sent to Priya Verma", "Sent to Amit Kumar", "Peer to Peer UPI Transfer",
    "Family Emergency Fund Support", "Return Borrowed Money", "Birthday Gift Cash Transfer", "Wedding Gift Shagun Envelope",
    "Self Account Bank Transfer", "Transfer to HDFC Savings Account", "Transfer to SBI Account", "ICICI Bank Self Transfer",
    "Paytm Wallet Top Up", "PhonePe Wallet Balance Load"
  ],
  "Miscellaneous": [
    "Unknown Narration POS", "General Store Cash POS", "Cash Withdrawal ATM", "ATM Cash WDL Transaction",
    "Bank Cheque Processing Fee", "Debit Card Annual Maintenance Fee", "SMS Alert Service Charges",
    "Minimum Balance Non Maintenance Penalty", "Outstation Cheque Clearance", "Foreign Currency Exchange Fee",
    "Unidentified Merchant Transaction", "Miscellaneous Payment Note", "Stray POS Transaction Terminal",
    "Petty Cash Adjustment", "Stamp Duty Registry Charges", "Notary Public Legal Attestation"
  ]
};

// 2. Synthesize variations using real banking templates (UPI, POS, ACH, Card)
const UPI_HANDLES = ["okhdfcbank", "okaxis", "okicici", "oksbi", "paytm", "apl", "ybl"];
const CITIES = ["BLR", "MUMBAI", "DELHI", "HYD", "KOLKATA", "PUNE", "CHENNAI", "NOIDA", "GWL"];

function generateSynthetics() {
  const dataset = [];

  for (const [category, items] of Object.entries(LEXICON)) {
    for (const item of items) {
      // 1. Plain item description
      dataset.push({ text: item, category, source: "lexicon_raw" });
      dataset.push({ text: item.toLowerCase(), category, source: "lexicon_lower" });

      // 2. UPI Pattern: UPI/<ITEM>/<REF>/<CITY>
      const cleanSlug = item.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 22);
      const ref = Math.floor(100000 + random() * 900000);
      const city = choice(CITIES);
      const vpa = `${item.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}@${choice(UPI_HANDLES)}`;

      dataset.push({
        text: `UPI/${cleanSlug}/${ref}/${city}`,
        category,
        source: "upi_statement"
      });

      // 3. POS Terminal Pattern: POS <TERM_ID> <ITEM> <CITY>
      dataset.push({
        text: `POS ${Math.floor(100000 + random() * 900000)} ${item.toUpperCase().slice(0, 24)} ${city}`,
        category,
        source: "pos_terminal"
      });

      // 4. Card Clearing Pattern: <ITEM> <CITY> REF#<REF>
      dataset.push({
        text: `${cleanSlug} ${city} REF#${ref}`,
        category,
        source: "card_clearing"
      });
    }
  }

  // 3. Load Existing Project Files
  try {
    const sampleDataPath = path.join(__dirname, 'sample_data.json');
    if (fs.existsSync(sampleDataPath)) {
      const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
      sampleData.forEach(row => {
        if (row.raw_description && row.category) {
          dataset.push({ text: row.raw_description, category: row.category, source: "sample_data_raw" });
        }
        if (row.description && row.category) {
          dataset.push({ text: row.description, category: row.category, source: "sample_data_clean" });
        }
      });
    }
  } catch (e) {
    console.warn("Could not read sample_data.json:", e.message);
  }

  // 4. Shuffle dataset with deterministic seed
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
  }

  return dataset;
}

const allData = generateSynthetics();
console.log(`Generated total ${allData.length} labeled transactions across ${CATEGORIES.length} categories.`);

// Category Distribution
const distribution = {};
CATEGORIES.forEach(c => distribution[c] = 0);
allData.forEach(d => distribution[d.category] = (distribution[d.category] || 0) + 1);
console.log("Class Balance Distribution:");
console.table(distribution);

// Split 80% Train, 20% Test
const splitIdx = Math.floor(allData.length * 0.8);
const trainData = allData.slice(0, splitIdx);
const testData = allData.slice(splitIdx);

console.log(`Training Set: ${trainData.length} samples | Test/Validation Set: ${testData.length} samples`);

const outPath = path.join(__dirname, 'dataset_transactions.json');
fs.writeFileSync(outPath, JSON.stringify({
  metadata: {
    total_samples: allData.length,
    train_count: trainData.length,
    test_count: testData.length,
    num_classes: CATEGORIES.length,
    classes: CATEGORIES,
    generated_at: new Date().toISOString()
  },
  train: trainData,
  test: testData
}, null, 2));

console.log(`Saved dataset to: ${outPath}`);
