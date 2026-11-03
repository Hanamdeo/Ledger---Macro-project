const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(filePath, 'utf8');

const oldSave = `function saveToStorage() {
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

const newSave = `function saveToStorage() {
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

const oldSaveCRLF = oldSave.replace(/\n/g, '\r\n');
const newSaveCRLF = newSave.replace(/\n/g, '\r\n');

if (code.includes(oldSaveCRLF)) {
  code = code.replace(oldSaveCRLF, newSaveCRLF);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✅ Updated saveToStorage CRLF');
} else if (code.includes(oldSave)) {
  code = code.replace(oldSave, newSave);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✅ Updated saveToStorage LF');
} else {
  console.log('⚠️ Could not match old saveToStorage');
}
