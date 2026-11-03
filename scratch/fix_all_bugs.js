/**
 * fix_all_bugs.js
 * Applies ALL outstanding fixes to app.js:
 *
 * Fix 1: RAGHAVEN/UPI-DR income bug
 *   - In aiCategorizeAllTransactions: change line 2917 filter so it does NOT
 *     include UPI/DR transactions with a misplaced credit value.
 *   - Add UPI/DR → credit=0 cross-check in extractTransactionsFromPdfText.
 *
 * Fix 2: Add DEFAULT_RULE for RAGHAVEN → Rent
 *
 * Fix 3: Add "Paym" to noise remark filter so RAGHAVEN shows cleanly
 *
 * Fix 4: DEFAULT_RULES also checked against textToClassify — ensure
 *   User Rules are checked BEFORE ML (already true). But also run
 *   DEFAULT_RULES against textToClassify for UPI entities to fix
 *   KANHAIYA->Food bug. Actually KANHAIYA is a pure ML issue — we need
 *   to add more Personal & Transfers training names. Instead, fix the
 *   DEFAULT_RULES loop to also run against entity for UPI transactions.
 *
 * Fix 5: Filter "SANJIVANI NAGAR" as a branch/location line in
 *   non-UPI narration filter (add SANJIVANI NAGAR to NOISE or narLines filter).
 *
 * Fix 6: The aiCategorizeAllTransactions credit guard is inverted —
 *   line 2917 ADDS credit>0 txns to the "needs categorization" list,
 *   then line 2932-2937 forces them to Income. This is doubly wrong:
 *   the filter at 2916-2919 should EXCLUDE credit>0 entirely.
 */

const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Normalize to LF for matching
let normalized = content.replace(/\r\n/g, '\n');

let changeLog = [];

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1: Add UPI/DR cross-check AFTER amount extraction in extractTransactionsFromPdfText
// Insert after line 2217 (after the fallback amount block closes)
// ─────────────────────────────────────────────────────────────────────────────
const fix1Target = `    // ── Extract date from first date-like token ──`;
const fix1Replacement = `    // ── Cross-validate DR/CR direction vs parsed amounts ──
    // SBI PDF: if narration says UPI/DR but parser found credit instead of debit
    // (can happen when Pattern C fires on a debit whose layout looks like "- - AMT BAL"),
    // swap them to match the actual transaction direction.
    if (/UPI\\/DR/i.test(combined) && credit > 0 && debit === 0) {
      debit = credit;
      credit = 0;
    } else if (/UPI\\/CR/i.test(combined) && debit > 0 && credit === 0) {
      credit = debit;
      debit = 0;
    }
    // Also apply for WDL TFR (withdrawal) — if narration says WDL TFR and credit is set, swap
    if (/^WDL\\s+TFR/i.test(combined) && credit > 0 && debit === 0) {
      debit = credit;
      credit = 0;
    }

    // ── Extract date from first date-like token ──`;

if (normalized.includes(fix1Target)) {
  normalized = normalized.replace(fix1Target, fix1Replacement);
  changeLog.push('✅ Fix 1: Added UPI/DR vs UPI/CR amount cross-check');
} else {
  changeLog.push('❌ Fix 1 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2: Add RAGHAVEN DEFAULT_RULE + RENT keyword fix
// Also fix SANJIVANI NAGAR appearing as narration (add to branch-line filter)
// ─────────────────────────────────────────────────────────────────────────────
const fix2Target = `  { id: 42, pattern: "GYM|FITNESS|WORKOUT", cleanMerchant: "Gym Membership", category: "Health & Wellness", type: "regex" }
];`;
const fix2Replacement = `  { id: 42, pattern: "GYM|FITNESS|WORKOUT", cleanMerchant: "Gym Membership", category: "Health & Wellness", type: "regex" },
  { id: 43, pattern: "RAGHAVEN|RAGHAVAN|RAGHVENDRA|LANDLORD|HOUSE RENT|MAKAN", cleanMerchant: "Rent Payment", category: "Utilities & Bills", type: "regex" },
  { id: 44, pattern: "HARIOM|HARIOME", cleanMerchant: "Hariom", category: "Personal & Transfers", type: "regex" },
  { id: 45, pattern: "JUGAL|KANHAIYA|PUNEET|SAUBHAG|SATYANAR|SOURABH|SAURABH|RAJESH", cleanMerchant: "Personal Transfer", category: "Personal & Transfers", type: "regex" }
];`;

if (normalized.includes(fix2Target)) {
  normalized = normalized.replace(fix2Target, fix2Replacement);
  changeLog.push('✅ Fix 2: Added RAGHAVEN (Rent), HARIOM, and peer-name DEFAULT_RULES (ids 43-45)');
} else {
  changeLog.push('❌ Fix 2 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3: Expand noise remark filter to catch "Paym", "Payme", "Payment"
// truncations AND add SANJIVANI, NAGAR as location noise
// ─────────────────────────────────────────────────────────────────────────────
const fix3Target = `    const isNoiseRemark = !rawRemark || /^(PAYME|UPI|NO\\s*R|NO\\s*RE|NO\\s*REMARK|NA|NONE|N\\/A|PAY|PAYMENT|OK|TRF|TRANSFER)$/i.test(rawRemark) || /^\\d+$/.test(rawRemark);`;
const fix3Replacement = `    const isNoiseRemark = !rawRemark || /^(PAYME?T?|UPI|NO\\s*R|NO\\s*RE|NO\\s*REMARK|NA|NONE|N\\/A|PAY|PAYMENT|OK|TRF|TRANSFER|NEFT|IMPS|RTGS)$/i.test(rawRemark) || /^\\d+$/.test(rawRemark) || /^(SANJIVANI|NAGAR|COLONY|SECTOR|PHASE|WARD)$/i.test(rawRemark);`;

if (normalized.includes(fix3Target)) {
  normalized = normalized.replace(fix3Target, fix3Replacement);
  changeLog.push('✅ Fix 3: Expanded noise remark filter (Paym, Payme, Payment, location words)');
} else {
  changeLog.push('❌ Fix 3 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4: aiCategorizeAllTransactions - remove the broken credit>0 filter entry
// Line 2917: currently adds credit>0 txns to miscTxns (wrong), then forces them
// to Income in the loop. Change: simply EXCLUDE credit>0 from miscTxns entirely
// so the loop only processes debit transactions that are Miscellaneous.
// ─────────────────────────────────────────────────────────────────────────────
const fix4Target = `  const miscTxns = state.transactions.filter(t => {
    if (Number(t.credit) > 0 && t.category !== "Income") return true;
    return !t.category || t.category === "Miscellaneous";
  });`;
const fix4Replacement = `  const miscTxns = state.transactions.filter(t => {
    // Only include debit transactions that haven't been categorized yet.
    // Credit transactions are Income by definition — never send to AI batch.
    if (Number(t.credit) > 0) return false;
    return !t.category || t.category === "Miscellaneous";
  });`;

if (normalized.includes(fix4Target)) {
  normalized = normalized.replace(fix4Target, fix4Replacement);
  changeLog.push('✅ Fix 4: Fixed aiCategorizeAllTransactions miscTxns filter (exclude credit>0)');
} else {
  changeLog.push('❌ Fix 4 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 5: Also run DEFAULT_RULES (not just state.rules) against UPI entity
// The DEFAULT_RULES array was NOT being checked at all in classifyDescription —
// only state.rules (user rules) are checked. Add DEFAULT_RULES check BEFORE ML.
// ─────────────────────────────────────────────────────────────────────────────
const fix5Target = `  // 5. User-Defined Rules (evaluated strictly against the merchant name)
  for (const rule of state.rules) {`;
const fix5Replacement = `  // 5. Rules evaluation — check both DEFAULT_RULES and user-defined rules
  const allRules = [...DEFAULT_RULES, ...state.rules];
  for (const rule of allRules) {`;

if (normalized.includes(fix5Target)) {
  normalized = normalized.replace(fix5Target, fix5Replacement);
  changeLog.push('✅ Fix 5: classifyDescription now checks DEFAULT_RULES before ML (not just user rules)');
} else {
  changeLog.push('❌ Fix 5 FAILED: target not found');
}

// Fix the loop variable reference: it now iterates over allRules but still references state.rules implicitly
// Make sure the loop body uses allRules (it does — we just changed "state.rules" to "allRules")

// ─────────────────────────────────────────────────────────────────────────────
// FIX 6: Add SANJIVANI NAGAR to the narLines filter so it never becomes narration
// ─────────────────────────────────────────────────────────────────────────────
const fix6Target = `        !/^(KARMETA|BALANCE|Page\\s*no)/i.test(l) &&
        !NOISE.test(l)`;
const fix6Replacement = `        !/^(KARMETA|BALANCE|Page\\s*no)/i.test(l) &&
        !/^(SANJIVANI|NAGAR|COLONY|SECTOR|PHASE)/i.test(l) &&
        !NOISE.test(l)`;

if (normalized.includes(fix6Target)) {
  normalized = normalized.replace(fix6Target, fix6Replacement);
  changeLog.push('✅ Fix 6: Added SANJIVANI NAGAR to non-UPI narration exclusion filter');
} else {
  changeLog.push('❌ Fix 6 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 7: In aiCategorizeAllTransactions loop — remove the credit guard block
// that forces credit>0 txns to Income (now handled by the filter fix above)
// But keep it as a safety net with a note.
// ─────────────────────────────────────────────────────────────────────────────
const fix7Target = `      // 1. Any incoming credit/deposit is strictly Income - never overwrite with an expense
      if (Number(txn.credit) > 0) {
        if (txn.category !== "Income") {
          txn.category = "Income";
          updatedCount++;
        }
        continue;
      }`;
const fix7Replacement = `      // 1. Safety net: skip credits (miscTxns filter should have excluded them already)
      if (Number(txn.credit) > 0) {
        continue;
      }`;

if (normalized.includes(fix7Target)) {
  normalized = normalized.replace(fix7Target, fix7Replacement);
  changeLog.push('✅ Fix 7: Cleaned up aiCategorizeAllTransactions loop credit guard');
} else {
  changeLog.push('❌ Fix 7 FAILED: target not found');
}

// ─────────────────────────────────────────────────────────────────────────────
// Write back with CRLF
// ─────────────────────────────────────────────────────────────────────────────
const output = normalized.replace(/\n/g, '\r\n');
fs.writeFileSync(appJsPath, output, 'utf8');

console.log('\n=== FIX RESULTS ===\n');
changeLog.forEach(c => console.log(c));
console.log('\n✅ app.js updated successfully.');
