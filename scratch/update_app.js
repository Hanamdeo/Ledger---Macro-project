const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace SQLite text in app.js
content = content.replace(/into SQLite Ledger!/g, 'into Supabase Cloud Ledger!');
content = content.replace(/into SQLite table!/g, 'into Supabase Cloud table!');
content = content.replace(/into SQLite Ledger!/g, 'into Supabase Cloud Ledger!');
content = content.replace(/into SQLite Transaction Table\./g, 'into Supabase Transaction Table.');
content = content.replace(/let sql = `-- SQLite Database Dump: Personal Finance Analytics\\n`;/g, 'let sql = `-- SQL Database Dump: Personal Finance Analytics\\n`;');
content = content.replace(/downloadFile\(sqlContent, `Personal_Finance_SQLite_Dump_\${new Date\(\)\.toISOString\(\)\.substring\(0, 10\)}\.sql`\);/g, 'downloadFile(sqlContent, `Personal_Finance_SQL_Dump_${new Date().toISOString().substring(0, 10)}.sql`);');
content = content.replace(/showToast\("Exported SQLite database script!", "success"\);/g, 'showToast("Exported SQL database script!", "success");');

// Update empty table state to include demo-only buttons or clean upload CTA
const oldEmptyStateButtons = `<div class="flex items-center justify-center space-x-3">
            <button onclick="addQuickSampleBatch(5)" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5">
              <span>⚡ Add 5 Sample Transactions</span>
            </button>
            <button onclick="resetToDefaultData()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition">
              🔄 Restore Full 54 Records
            </button>
          </div>`;

const newEmptyStateButtons = `<div class="flex items-center justify-center space-x-3">
            <button onclick="document.querySelector('[data-target=\\'section-parser\\']').click()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition flex items-center space-x-1.5">
              <span>📄 Upload Bank Statement</span>
            </button>
            <button onclick="document.getElementById('btn-open-add-modal').click()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition">
              + Add Transaction
            </button>
            <button onclick="addQuickSampleBatch(5)" class="demo-only-element px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5">
              <span>⚡ Add 5 Sample Transactions</span>
            </button>
          </div>`;

content = content.replace(oldEmptyStateButtons, newEmptyStateButtons);

// Update renderAuthenticatedUI
const oldRenderAuthUI = `function renderAuthenticatedUI(user) {
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");
  const headerAvatar = document.getElementById("header-user-avatar");
  const headerName = document.getElementById("header-user-name");

  if (authContainer) authContainer.classList.add("hidden");
  if (appContainer) appContainer.classList.remove("hidden");

  if (user) {
    const displayName = user.name || user.email.split("@")[0];
    const initials = displayName
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    if (headerAvatar) headerAvatar.textContent = initials || "HN";
    if (headerName) headerName.textContent = displayName;
  }
}`;

const newRenderAuthUI = `function renderAuthenticatedUI(user) {
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");
  const headerAvatar = document.getElementById("header-user-avatar");
  const headerName = document.getElementById("header-user-name");

  if (authContainer) authContainer.classList.add("hidden");
  if (appContainer) appContainer.classList.remove("hidden");

  if (user) {
    const displayName = user.name || user.email.split("@")[0];
    const initials = displayName
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    if (headerAvatar) headerAvatar.textContent = initials || "HN";
    if (headerName) headerName.textContent = displayName;

    // Toggle demo-only elements based on user account type
    const isDemo = Boolean(user.isDemo || user.email === "demo@ledger.finance" || user.username === "demo");
    const demoElements = document.querySelectorAll(".demo-only-element");
    demoElements.forEach(el => {
      if (isDemo) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });
  }
}`;

content = content.replace(oldRenderAuthUI, newRenderAuthUI);

// Update loginAsDemoUser to explicitly mark user as demo
const oldDemoUser = `function loginAsDemoUser() {
  const demoUser = {
    name: "Harshit Namdeo",
    email: "harshit@ledger.finance",
    username: "harshit",
    createdAt: "2026-08-01"
  };`;

const newDemoUser = `function loginAsDemoUser() {
  const demoUser = {
    name: "Demo Evaluator",
    email: "demo@ledger.finance",
    username: "demo",
    isDemo: true,
    createdAt: "2026-08-01"
  };`;

content = content.replace(oldDemoUser, newDemoUser);

// Update saveToStorage to save to Supabase
const oldSaveToStorage = `function saveToStorage() {
  localStorage.setItem("pf_transactions", JSON.stringify(state.transactions));
  localStorage.setItem("pf_rules", JSON.stringify(state.rules));

  // Sync to Supabase Cloud if signed in
  if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.cloudSaveTransactions) {
    try {
      const sessionUser = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
      if (sessionUser && sessionUser.isCloud) {
        window.cloudSaveTransactions(state.transactions).catch(err => {
          console.warn("Background cloud sync note:", err);
        });
      }
    } catch (e) {
      // ignore
    }
  }
}`;

const newSaveToStorage = `function saveToStorage() {
  localStorage.setItem("pf_transactions", JSON.stringify(state.transactions));
  localStorage.setItem("pf_rules", JSON.stringify(state.rules));

  // Sync to Supabase Cloud if signed in (authenticated cloud user)
  if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.cloudSaveTransactions) {
    try {
      const sessionUser = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
      if (sessionUser && (sessionUser.isCloud || !sessionUser.isDemo)) {
        window.cloudSaveTransactions(state.transactions).catch(err => {
          console.warn("Background Supabase sync error:", err);
        });
      }
    } catch (e) {
      console.warn("Supabase save error:", e);
    }
  }
}`;

content = content.replace(oldSaveToStorage, newSaveToStorage);

// Update deleteTransaction to also delete from Supabase
const oldDeleteTransaction = `function deleteTransaction(id) {
  if (confirm(\`Are you sure you want to delete transaction \${id}?\`)) {
    state.transactions = state.transactions.filter(t => t.transaction_id !== id);
    saveToStorage();
    updateDashboard();
    showToast(\`Transaction \${id} deleted successfully.\`, "info");
  }
}`;

const newDeleteTransaction = `function deleteTransaction(id) {
  if (confirm(\`Are you sure you want to delete transaction \${id}?\`)) {
    state.transactions = state.transactions.filter(t => t.transaction_id !== id);
    if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.cloudDeleteTransaction) {
      try {
        const sessionUser = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
        if (sessionUser && (sessionUser.isCloud || !sessionUser.isDemo)) {
          window.cloudDeleteTransaction(id).catch(err => console.warn("Supabase delete error:", err));
        }
      } catch (e) {}
    }
    saveToStorage();
    updateDashboard();
    showToast(\`Transaction \${id} deleted successfully.\`, "info");
  }
}`;

content = content.replace(oldDeleteTransaction, newDeleteTransaction);

// Update executeHardReset to also clear from Supabase and use pf_transactions key
const oldExecuteHardReset = `function executeHardReset() {
  document.getElementById("modal-hard-reset")?.classList.add("hidden");
  
  // 1. Wipe in-memory transactions
  state.transactions = [];
  
  // 2. Clear browser localStorage
  localStorage.removeItem("ledger_transactions");
  localStorage.setItem("ledger_transactions", JSON.stringify([]));`;

const newExecuteHardReset = `function executeHardReset() {
  document.getElementById("modal-hard-reset")?.classList.add("hidden");
  
  // 1. Wipe in-memory transactions
  state.transactions = [];
  
  // 2. Clear Supabase Cloud transactions if authenticated
  if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.cloudClearAllTransactions) {
    try {
      const sessionUser = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
      if (sessionUser && (sessionUser.isCloud || !sessionUser.isDemo)) {
        window.cloudClearAllTransactions().catch(err => console.warn("Supabase clear error:", err));
      }
    } catch (e) {}
  }

  // 3. Clear browser localStorage
  localStorage.removeItem("pf_transactions");
  localStorage.setItem("pf_transactions", JSON.stringify([]));
  localStorage.removeItem("ledger_transactions");`;

content = content.replace(oldExecuteHardReset, newExecuteHardReset);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated app.js');
