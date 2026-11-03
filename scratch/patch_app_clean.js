const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update renderAuthenticatedUI
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

const oldRenderAuthUICRLF = oldRenderAuthUI.replace(/\n/g, '\r\n');
const newRenderAuthUICRLF = newRenderAuthUI.replace(/\n/g, '\r\n');

if (code.includes(oldRenderAuthUICRLF)) {
  code = code.replace(oldRenderAuthUICRLF, newRenderAuthUICRLF);
  console.log('✅ Updated renderAuthenticatedUI (CRLF)');
} else if (code.includes(oldRenderAuthUI)) {
  code = code.replace(oldRenderAuthUI, newRenderAuthUI);
  console.log('✅ Updated renderAuthenticatedUI (LF)');
} else {
  console.log('⚠️ renderAuthenticatedUI not matched');
}

// 2. Update loginAsDemoUser
const oldDemo = `function loginAsDemoUser() {
  const demoUser = {
    name: "Harshit Namdeo",
    email: "harshit@ledger.finance",
    username: "harshit",
    createdAt: "2026-08-01"
  };`;

const newDemo = `function loginAsDemoUser() {
  const demoUser = {
    name: "Demo Evaluator",
    email: "demo@ledger.finance",
    username: "demo",
    isDemo: true,
    createdAt: "2026-08-01"
  };`;

const oldDemoCRLF = oldDemo.replace(/\n/g, '\r\n');
const newDemoCRLF = newDemo.replace(/\n/g, '\r\n');

if (code.includes(oldDemoCRLF)) {
  code = code.replace(oldDemoCRLF, newDemoCRLF);
  console.log('✅ Updated loginAsDemoUser (CRLF)');
} else if (code.includes(oldDemo)) {
  code = code.replace(oldDemo, newDemo);
  console.log('✅ Updated loginAsDemoUser (LF)');
} else {
  console.log('⚠️ loginAsDemoUser not matched');
}

// 3. Clear transactions on Supabase signup
const oldSignUpSupabase = `const appUser = {
        id: user.id,
        name: name,
        email: email,
        isCloud: true
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      renderAuthenticatedUI(appUser);`;

const newSignUpSupabase = `const appUser = {
        id: user.id,
        name: name,
        email: email,
        isCloud: true,
        isDemo: false
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      state.transactions = [];
      saveToStorage();
      renderAuthenticatedUI(appUser);
      updateDashboard();`;

const oldSignUpSupabaseCRLF = oldSignUpSupabase.replace(/\n/g, '\r\n');
const newSignUpSupabaseCRLF = newSignUpSupabase.replace(/\n/g, '\r\n');

if (code.includes(oldSignUpSupabaseCRLF)) {
  code = code.replace(oldSignUpSupabaseCRLF, newSignUpSupabaseCRLF);
  console.log('✅ Updated handleSignUpSubmit Supabase branch (CRLF)');
} else if (code.includes(oldSignUpSupabase)) {
  code = code.replace(oldSignUpSupabase, newSignUpSupabase);
  console.log('✅ Updated handleSignUpSubmit Supabase branch (LF)');
} else {
  console.log('⚠️ handleSignUpSubmit Supabase branch not matched');
}

// 4. Clear transactions on local signup
const oldSignUpLocal = `users.push(newUser);
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newUser));

  renderAuthenticatedUI(newUser);`;

const newSignUpLocal = `users.push(newUser);
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newUser));
  state.transactions = [];
  saveToStorage();
  renderAuthenticatedUI(newUser);
  updateDashboard();`;

const oldSignUpLocalCRLF = oldSignUpLocal.replace(/\n/g, '\r\n');
const newSignUpLocalCRLF = newSignUpLocal.replace(/\n/g, '\r\n');

if (code.includes(oldSignUpLocalCRLF)) {
  code = code.replace(oldSignUpLocalCRLF, newSignUpLocalCRLF);
  console.log('✅ Updated handleSignUpSubmit local branch (CRLF)');
} else if (code.includes(oldSignUpLocal)) {
  code = code.replace(oldSignUpLocal, newSignUpLocal);
  console.log('✅ Updated handleSignUpSubmit local branch (LF)');
} else {
  console.log('⚠️ handleSignUpSubmit local branch not matched');
}

// 5. Clear state on signout
const oldSignOut = `localStorage.removeItem(AUTH_SESSION_KEY);
  renderUnauthenticatedUI();`;

const newSignOut = `localStorage.removeItem(AUTH_SESSION_KEY);
  state.transactions = [];
  saveToStorage();
  updateDashboard();
  renderUnauthenticatedUI();`;

const oldSignOutCRLF = oldSignOut.replace(/\n/g, '\r\n');
const newSignOutCRLF = newSignOut.replace(/\n/g, '\r\n');

if (code.includes(oldSignOutCRLF)) {
  code = code.replace(oldSignOutCRLF, newSignOutCRLF);
  console.log('✅ Updated handleSignOut (CRLF)');
} else if (code.includes(oldSignOut)) {
  code = code.replace(oldSignOut, newSignOut);
  console.log('✅ Updated handleSignOut (LF)');
} else {
  console.log('⚠️ handleSignOut not matched');
}

// 6. Delete from Supabase in deleteTransaction
const oldDelete = `function deleteTransaction(id) {
  if (confirm(\`Are you sure you want to delete transaction \${id}?\`)) {
    state.transactions = state.transactions.filter(t => t.transaction_id !== id);
    saveToStorage();
    updateDashboard();
    showToast(\`Transaction \${id} deleted successfully.\`, "info");
  }
}`;

const newDelete = `function deleteTransaction(id) {
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

const oldDeleteCRLF = oldDelete.replace(/\n/g, '\r\n');
const newDeleteCRLF = newDelete.replace(/\n/g, '\r\n');

if (code.includes(oldDeleteCRLF)) {
  code = code.replace(oldDeleteCRLF, newDeleteCRLF);
  console.log('✅ Updated deleteTransaction (CRLF)');
} else if (code.includes(oldDelete)) {
  code = code.replace(oldDelete, newDelete);
  console.log('✅ Updated deleteTransaction (LF)');
} else {
  console.log('⚠️ deleteTransaction not matched');
}

// 7. Clear Supabase in executeHardReset
const oldReset = `function executeHardReset() {
  document.getElementById("modal-hard-reset")?.classList.add("hidden");
  
  // 1. Wipe in-memory transactions
  state.transactions = [];
  
  // 2. Clear browser localStorage
  localStorage.removeItem("ledger_transactions");
  localStorage.setItem("ledger_transactions", JSON.stringify([]));`;

const newReset = `function executeHardReset() {
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

const oldResetCRLF = oldReset.replace(/\n/g, '\r\n');
const newResetCRLF = newReset.replace(/\n/g, '\r\n');

if (code.includes(oldResetCRLF)) {
  code = code.replace(oldResetCRLF, newResetCRLF);
  console.log('✅ Updated executeHardReset (CRLF)');
} else if (code.includes(oldReset)) {
  code = code.replace(oldReset, newReset);
  console.log('✅ Updated executeHardReset (LF)');
} else {
  console.log('⚠️ executeHardReset not matched');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved app.js successfully');
