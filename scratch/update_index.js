const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Header action sample data container
html = html.replace(
  /<!-- 1-Click Add Sample Data Button & Menu -->\s*<div class="relative group">/,
  '<!-- 1-Click Add Sample Data Button & Menu -->\n          <div class="relative group demo-only-element">'
);

// 2. Header reset button (icon next to signout)
html = html.replace(
  /<button onclick="resetToDefaultData\(\)" class="p-1\.5 rounded-lg bg-slate-800/,
  '<button onclick="resetToDefaultData()" class="demo-only-element p-1.5 rounded-lg bg-slate-800'
);

// 3. Quick Sample Action Bar on Dashboard
html = html.replace(
  /<!-- Quick Sample Action Bar -->\s*<div class="glass-panel p-3\.5/,
  '<!-- Quick Sample Action Bar -->\n      <div class="demo-only-element glass-panel p-3.5'
);

// 4. Ledger Table action sample data button
html = html.replace(
  /<button onclick="addQuickSampleBatch\(5\)" class="px-3 py-1\.5 text-xs font-bold rounded-lg bg-amber-500\/10/,
  '<button onclick="addQuickSampleBatch(5)" class="demo-only-element px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10'
);

// 5. Replace SQLite text in HTML
html = html.replace(/<span>.*?\s*SQLite DDL & Inserts<\/span>/g, '<span>🗄️ SQL DDL & Inserts</span>');
html = html.replace(/SQLite Database Engine Synchronized/g, 'Supabase Cloud Database Synchronized');
html = html.replace(/Powered by Chart\.js & Normalized SQLite Data/g, 'Powered by Chart.js & Supabase Cloud Data');
html = html.replace(/Transaction Table \(SQLite Database Explorer\)/g, 'Transaction Table (Cloud Database Explorer)');
html = html.replace(/Displaying processed transactions from local SQLite persistent storage/g, 'Displaying processed transactions synchronized with Supabase Cloud');
html = html.replace(/Save to SQLite Ledger/g, 'Save to Cloud Ledger');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated index.html');
