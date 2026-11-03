const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Better demo session detection: only users with isDemo === true or explicit demo credentials
const oldIsDemoFunc = `function isCurrentSessionDemo() {
  try {
    const u = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    return Boolean(u && (u.isDemo || u.email === "demo@ledger.finance" || u.username === "demo"));
  } catch (e) {
    return false;
  }
}`;

const newIsDemoFunc = `function isCurrentSessionDemo() {
  try {
    const u = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    if (!u) return false;
    // An account is demo ONLY if explicitly flagged isDemo: true or using the demo evaluator email/username
    return Boolean(u.isDemo === true || u.email === "demo@ledger.finance" || u.username === "demo");
  } catch (e) {
    return false;
  }
}`;

const oldIsDemoFuncCRLF = oldIsDemoFunc.replace(/\n/g, '\r\n');
const newIsDemoFuncCRLF = newIsDemoFunc.replace(/\n/g, '\r\n');

if (code.includes(oldIsDemoFuncCRLF)) {
  code = code.replace(oldIsDemoFuncCRLF, newIsDemoFuncCRLF);
} else if (code.includes(oldIsDemoFunc)) {
  code = code.replace(oldIsDemoFunc, newIsDemoFunc);
}

// 2. In initStorage: ALWAYS clear transactions if this is a real user starting empty or user has changed!
// Specifically, tie localStorage to the user's specific account so switching accounts never leaks data:
const oldInitStorage = `function initStorage() {
  // ── One-time migration: wipe stale data from old versions ──
  // If the stored version key doesn't match, the user has old mixed/demo data
  // from a previous session. Clear it so they start fresh.
  const storedVersion = localStorage.getItem("pf_app_version");
  if (storedVersion !== APP_STORAGE_VERSION) {
    localStorage.removeItem("pf_transactions");
    localStorage.removeItem("pf_rules");
    localStorage.setItem("pf_app_version", APP_STORAGE_VERSION);
    // Start with NO transactions — ready to upload real bank statement
    state.transactions = [];
    state.rules = [...DEFAULT_RULES];
    return;
  }

  const savedTxns = localStorage.getItem("pf_transactions");
  if (savedTxns) {
    try {
      state.transactions = JSON.parse(savedTxns);
    } catch (e) {
      state.transactions = [];
    }
  } else {
    state.transactions = [];
  }

  const savedRules = localStorage.getItem("pf_rules");
  if (savedRules) {
    try {
      state.rules = JSON.parse(savedRules);
    } catch (e) {
      state.rules = [...DEFAULT_RULES];
    }
  } else {
    state.rules = [...DEFAULT_RULES];
  }
}`;

const newInitStorage = `function getUserStorageKey() {
  try {
    const u = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    if (!u) return "guest";
    return u.id || u.email || "guest";
  } catch (e) {
    return "guest";
  }
}

function initStorage() {
  const userKey = getUserStorageKey();
  const txKey = "pf_txns_" + userKey;
  
  // Clean legacy shared storage to prevent cross-account contamination
  localStorage.removeItem("ledger_transactions");
  
  const savedTxns = localStorage.getItem(txKey);
  if (savedTxns) {
    try {
      state.transactions = JSON.parse(savedTxns);
    } catch (e) {
      state.transactions = [];
    }
  } else {
    state.transactions = [];
  }

  const savedRules = localStorage.getItem("pf_rules");
  if (savedRules) {
    try {
      state.rules = JSON.parse(savedRules);
    } catch (e) {
      state.rules = [...DEFAULT_RULES];
    }
  } else {
    state.rules = [...DEFAULT_RULES];
  }
}`;

const oldInitStorageCRLF = oldInitStorage.replace(/\n/g, '\r\n');
const newInitStorageCRLF = newInitStorage.replace(/\n/g, '\r\n');

if (code.includes(oldInitStorageCRLF)) {
  code = code.replace(oldInitStorageCRLF, newInitStorageCRLF);
  console.log('✅ Updated initStorage to user-scoped storage (CRLF)');
} else if (code.includes(oldInitStorage)) {
  code = code.replace(oldInitStorage, newInitStorage);
  console.log('✅ Updated initStorage to user-scoped storage (LF)');
} else {
  console.log('⚠️ Could not match oldInitStorage');
}

// 3. Update saveToStorage to save under the user-scoped key
const oldSaveStorage = `function saveToStorage() {
  localStorage.setItem("pf_transactions", JSON.stringify(state.transactions));
  localStorage.setItem("pf_rules", JSON.stringify(state.rules));`;

const newSaveStorage = `function saveToStorage() {
  const userKey = getUserStorageKey();
  localStorage.setItem("pf_txns_" + userKey, JSON.stringify(state.transactions));
  localStorage.setItem("pf_transactions", JSON.stringify(state.transactions));
  localStorage.setItem("pf_rules", JSON.stringify(state.rules));`;

const oldSaveStorageCRLF = oldSaveStorage.replace(/\n/g, '\r\n');
const newSaveStorageCRLF = newSaveStorage.replace(/\n/g, '\r\n');

if (code.includes(oldSaveStorageCRLF)) {
  code = code.replace(oldSaveStorageCRLF, newSaveStorageCRLF);
  console.log('✅ Updated saveToStorage to user-scoped key (CRLF)');
} else if (code.includes(oldSaveStorage)) {
  code = code.replace(oldSaveStorage, newSaveStorage);
  console.log('✅ Updated saveToStorage to user-scoped key (LF)');
} else {
  console.log('⚠️ Could not match oldSaveStorage');
}

// 4. Update executeHardReset to wipe user-scoped key as well
const oldHardReset = `  // 3. Clear browser localStorage
  localStorage.removeItem("pf_transactions");
  localStorage.setItem("pf_transactions", JSON.stringify([]));
  localStorage.removeItem("ledger_transactions");`;

const newHardReset = `  // 3. Clear browser localStorage
  const userKey = getUserStorageKey();
  localStorage.removeItem("pf_txns_" + userKey);
  localStorage.removeItem("pf_transactions");
  localStorage.setItem("pf_transactions", JSON.stringify([]));
  localStorage.removeItem("ledger_transactions");`;

const oldHardResetCRLF = oldHardReset.replace(/\n/g, '\r\n');
const newHardResetCRLF = newHardReset.replace(/\n/g, '\r\n');

if (code.includes(oldHardResetCRLF)) {
  code = code.replace(oldHardResetCRLF, newHardResetCRLF);
  console.log('✅ Updated executeHardReset to clear user-scoped key (CRLF)');
} else if (code.includes(oldHardReset)) {
  code = code.replace(oldHardReset, newHardReset);
  console.log('✅ Updated executeHardReset to clear user-scoped key (LF)');
}

// 5. In handleSignInSubmit: clear local state and reload clean state before syncing from cloud
const oldSignInSubmit = `      const appUser = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email.split("@")[0],
        email: user.email,
        isCloud: true
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      renderAuthenticatedUI(appUser);
      showToast(\`Welcome back, \${appUser.name}! (Cloud Verified)\`, "success");
      idInput.value = "";
      passInput.value = "";
      await syncFromCloud();
      return;`;

const newSignInSubmit = `      const appUser = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email.split("@")[0],
        email: user.email,
        isCloud: true,
        isDemo: false
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      initStorage(); // Load this specific user's cache or start clean
      renderAuthenticatedUI(appUser);
      updateDashboard();
      showToast(\`Welcome back, \${appUser.name}! (Cloud Verified)\`, "success");
      idInput.value = "";
      passInput.value = "";
      await syncFromCloud();
      return;`;

const oldSignInSubmitCRLF = oldSignInSubmit.replace(/\n/g, '\r\n');
const newSignInSubmitCRLF = newSignInSubmit.replace(/\n/g, '\r\n');

if (code.includes(oldSignInSubmitCRLF)) {
  code = code.replace(oldSignInSubmitCRLF, newSignInSubmitCRLF);
  console.log('✅ Updated handleSignInSubmit cloud branch (CRLF)');
} else if (code.includes(oldSignInSubmit)) {
  code = code.replace(oldSignInSubmit, newSignInSubmit);
  console.log('✅ Updated handleSignInSubmit cloud branch (LF)');
}

// 6. In handleSignInSubmit local branch
const oldSignInLocal = `  if (matchedUser) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(matchedUser));
    renderAuthenticatedUI(matchedUser);
    showToast(\`Welcome back, \${matchedUser.name}!\`, "success");
    idInput.value = "";
    passInput.value = "";
  }`;

const newSignInLocal = `  if (matchedUser) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(matchedUser));
    initStorage();
    renderAuthenticatedUI(matchedUser);
    updateDashboard();
    showToast(\`Welcome back, \${matchedUser.name}!\`, "success");
    idInput.value = "";
    passInput.value = "";
  }`;

const oldSignInLocalCRLF = oldSignInLocal.replace(/\n/g, '\r\n');
const newSignInLocalCRLF = newSignInLocal.replace(/\n/g, '\r\n');

if (code.includes(oldSignInLocalCRLF)) {
  code = code.replace(oldSignInLocalCRLF, newSignInLocalCRLF);
  console.log('✅ Updated handleSignInSubmit local branch (CRLF)');
} else if (code.includes(oldSignInLocal)) {
  code = code.replace(oldSignInLocal, newSignInLocal);
  console.log('✅ Updated handleSignInSubmit local branch (LF)');
}

// 7. Add Forgot Password Handlers and window exports
const forgotHandlers = `
// ==========================================
// FORGOT PASSWORD / PASSWORD RECOVERY
// ==========================================
function openForgotPasswordModal() {
  const modal = document.getElementById("modal-forgot-password");
  const alertBox = document.getElementById("forgot-alert");
  const emailInput = document.getElementById("forgot-email");
  const currentLoginEmail = document.getElementById("signin-identifier")?.value.trim() || "";

  if (alertBox) alertBox.classList.add("hidden");
  if (emailInput && currentLoginEmail && currentLoginEmail.includes("@")) {
    emailInput.value = currentLoginEmail;
  }
  if (modal) modal.classList.remove("hidden");
}

function closeForgotPasswordModal() {
  const modal = document.getElementById("modal-forgot-password");
  if (modal) modal.classList.add("hidden");
}

async function handleForgotPasswordSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("forgot-email");
  const alertBox = document.getElementById("forgot-alert");
  const alertIcon = document.getElementById("forgot-alert-icon");
  const alertText = document.getElementById("forgot-alert-text");
  const submitBtn = document.getElementById("btn-submit-forgot");

  if (!emailInput) return;
  const email = emailInput.value.trim().toLowerCase();
  if (!email) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending link...</span>";
  }

  try {
    if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.cloudResetPassword) {
      await window.cloudResetPassword(email);
      if (alertBox && alertText && alertIcon) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center space-x-2";
        alertIcon.textContent = "✓";
        alertText.textContent = \`Password reset link sent to \${email}! Please check your email inbox.\`;
        alertBox.classList.remove("hidden");
      }
      showToast("Password reset link sent! Check your email.", "success");
      setTimeout(() => {
        closeForgotPasswordModal();
      }, 3500);
    } else {
      // Local fallback
      if (alertBox && alertText && alertIcon) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 flex items-center space-x-2";
        alertIcon.textContent = "ℹ";
        alertText.textContent = \`A password recovery link has been simulated for \${email}.\`;
        alertBox.classList.remove("hidden");
      }
      showToast("Recovery instruction generated.", "info");
    }
  } catch (err) {
    if (alertBox && alertText && alertIcon) {
      alertBox.className = "p-3 rounded-xl text-xs font-medium border bg-rose-500/10 border-rose-500/30 text-rose-400 flex items-center space-x-2";
      alertIcon.textContent = "✕";
      alertText.textContent = err.message || "Failed to send reset link. Verify your email.";
      alertBox.classList.remove("hidden");
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "<span>Send Reset Link</span>";
    }
  }
}
`;

if (!code.includes('openForgotPasswordModal')) {
  code = code.replace('// Initialize Application', forgotHandlers + '\n// Initialize Application');
  code += `\nwindow.openForgotPasswordModal = openForgotPasswordModal;\nwindow.closeForgotPasswordModal = closeForgotPasswordModal;\nwindow.handleForgotPasswordSubmit = handleForgotPasswordSubmit;\nwindow.getUserStorageKey = getUserStorageKey;\n`;
  console.log('✅ Added Forgot Password handlers and window exports');
}

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('Saved app.js successfully');
