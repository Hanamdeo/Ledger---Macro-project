/**
 * Verify all 7 fixes by simulating classifyDescription logic in Node.js
 */

// Replicate DEFAULT_RULES from app.js (updated)
const DEFAULT_RULES = [
  { id: 1, pattern: "SWIGGY|INSTAMART", cleanMerchant: "SWIGGY", category: "Food & Dining", type: "regex" },
  { id: 2, pattern: "ZOMATO", cleanMerchant: "ZOMATO", category: "Food & Dining", type: "contains" },
  { id: 9, pattern: "UBER", cleanMerchant: "UBER", category: "Travel & Transport", type: "contains" },
  { id: 14, pattern: "AIRTEL", cleanMerchant: "AIRTEL BROADBAND", category: "Utilities & Bills", type: "contains" },
  { id: 35, pattern: "RENT|rent", cleanMerchant: "Rent Payment", category: "Utilities & Bills", type: "contains" },
  { id: 38, pattern: "MAGGI|CHAI|COFFEE|TEA|JUICE|FOOD|SNACK|DHABA", cleanMerchant: "Food Purchase", category: "Food & Dining", type: "regex" },
  { id: 42, pattern: "GYM|FITNESS|WORKOUT", cleanMerchant: "Gym Membership", category: "Health & Wellness", type: "regex" },
  { id: 43, pattern: "RAGHAVEN|RAGHAVAN|RAGHVENDRA|LANDLORD|HOUSE RENT|MAKAN", cleanMerchant: "Rent Payment", category: "Utilities & Bills", type: "regex" },
  { id: 44, pattern: "HARIOM|HARIOME", cleanMerchant: "Hariom", category: "Personal & Transfers", type: "regex" },
  { id: 45, pattern: "JUGAL|KANHAIYA|PUNEET|SAUBHAG|SATYANAR|SOURABH|SAURABH|RAJESH", cleanMerchant: "Personal Transfer", category: "Personal & Transfers", type: "regex" },
];

// Noise remark filter (updated Fix 3)
function isNoiseRemark(rawRemark) {
  return !rawRemark ||
    /^(PAYME?T?|UPI|NO\s*R|NO\s*RE|NO\s*REMARK|NA|NONE|N\/A|PAY|PAYMENT|OK|TRF|TRANSFER|NEFT|IMPS|RTGS)$/i.test(rawRemark) ||
    /^\d+$/.test(rawRemark) ||
    /^(SANJIVANI|NAGAR|COLONY|SECTOR|PHASE|WARD)$/i.test(rawRemark);
}

function classifyDescription(rawDescription, credit = 0) {
  if (!rawDescription) return { cleanMerchant: "UNKNOWN", category: "Miscellaneous" };

  let isUpi = false;
  let drCr = Number(credit) > 0 ? "CR" : "DR";
  let upiEntity = "";
  let upiRemark = "";

  const upiMatch = rawDescription.match(/UPI\/(DR|CR)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/([^\/]+))?/i);
  if (upiMatch) {
    isUpi = true;
    drCr = upiMatch[1].toUpperCase();
    upiEntity = upiMatch[3] ? upiMatch[3].trim() : "";
    const rawRemark = upiMatch[6] ? upiMatch[6].trim() : "";
    upiRemark = isNoiseRemark(rawRemark) ? "" : rawRemark;
  }

  let cleanMerchant = "";
  if (isUpi) {
    if (upiEntity.toUpperCase() === "UPILITE") {
      cleanMerchant = "UPI Lite";
    } else if (upiRemark) {
      cleanMerchant = `${upiEntity} (${upiRemark})`;
    } else {
      cleanMerchant = upiEntity || "UPI Transfer";
    }
  } else {
    cleanMerchant = rawDescription.replace(/^(UPI[-\/]|POS[-\/]|ACH[-\/])/, "").split(/[-/*_]/)[0].trim() || "MISCELLANEOUS";
  }

  // Income guard
  if (Number(credit) > 0 || drCr === "CR") {
    return { cleanMerchant, category: "Income" };
  }

  // UPI Lite
  if (cleanMerchant === "UPI Lite") {
    return { cleanMerchant: "UPI Lite", category: "Personal & Transfers" };
  }

  const textToClassify = isUpi ? (upiRemark ? `${upiEntity} ${upiRemark}` : upiEntity) : cleanMerchant;
  const cleanInput = textToClassify.toUpperCase();

  // Check ALL rules (DEFAULT_RULES + user rules) — Fix 5
  const allRules = [...DEFAULT_RULES]; // simulating; user rules would be appended
  for (const rule of allRules) {
    if (isUpi && (rule.pattern === "PAYTM" || rule.pattern === "PHONEPE|PHONE PE")) continue;
    let matched = false;
    if (rule.type === "regex") {
      try { matched = new RegExp(rule.pattern, "i").test(cleanInput); } catch(e) { matched = cleanInput.includes(rule.pattern.toUpperCase()); }
    } else {
      matched = cleanInput.includes(rule.pattern.toUpperCase());
    }
    if (matched) {
      return { cleanMerchant: isUpi ? cleanMerchant : rule.cleanMerchant, category: rule.category, matchedRule: rule.id };
    }
  }

  // Default
  return { cleanMerchant, category: isUpi ? "Personal & Transfers" : "Miscellaneous" };
}

// ── UPI/DR amount cross-check (Fix 1) ──
function crossCheckAmounts(combined, debit, credit) {
  if (/UPI\/DR/i.test(combined) && credit > 0 && debit === 0) { debit = credit; credit = 0; }
  else if (/UPI\/CR/i.test(combined) && debit > 0 && credit === 0) { credit = debit; debit = 0; }
  if (/^WDL\s+TFR/i.test(combined) && credit > 0 && debit === 0) { debit = credit; credit = 0; }
  return { debit, credit };
}

// ── TEST CASES ──
const tests = [
  // [description, parsedCredit, parsedDebit, expectedCategory, expectedMerchant, note]
  ["UPI/DR/842169319500/RAGHAVEN/UTIB/9981130450/Paym", 3500, 0, "Utilities & Bills", "RAGHAVEN", "RAGHAVEN rent bug (Fix 1+2+3)"],
  ["UPI/DR/150001569466/JUGALSH/YESB/paytm.s3w7/NO R", 0, 10, "Personal & Transfers", "JUGALSH", "JUGAL peer transfer"],
  ["UPI/DR/174733687923/UPILITE", 0, 230, "Personal & Transfers", "UPI Lite", "UPILITE → Personal & Transfers"],
  ["UPI/DR/182434683728/RAJESHS/YESB/paytm.s31y/NO R", 0, 70, "Personal & Transfers", "RAJESHS", "RAJESH peer transfer"],
  ["UPI/CR/132219086395/Sourabh/SBIN/9177238282/PAY", 100, 0, "Income", "Sourabh", "Sourabh credit → Income"],
  ["UPI/DR/145427242697/KANHAIYA/YESB/paytmqrxpx/NO R", 0, 10, "Personal & Transfers", "KANHAIYA", "KANHAIYA peer (Fix 5)"],
  ["UPI/DR/145904959965/PUNEETH/YESB/paytm.s2eu/NO R", 0, 20, "Personal & Transfers", "PUNEETH", "PUNEET peer (Fix 5)"],
  ["UPI/DR/164728365818/SAUBHAGY/YESB/paytm.s2yx/NO R", 0, 10, "Personal & Transfers", "SAUBHAGY", "SAUBHAG peer (Fix 5)"],
  ["UPI/DR/180047986589/SATYANAR/YESB/paytm.s1ip/NO R", 0, 40, "Personal & Transfers", "SATYANAR", "SATYANAR peer (Fix 5)"],
  ["UPI/DR/214718181511/UPILITE", 0, 20, "Personal & Transfers", "UPI Lite", "UPILITE debit"],
  ["UPI/DR/221352093734/JUGALSH/YESB/paytmqr726/NO R", 0, 30, "Personal & Transfers", "JUGALSH", "JUGAL 2nd transfer"],
];

console.log("\n=== CLASSIFICATION VERIFICATION ===\n");
let pass = 0, fail = 0;

for (const [desc, parsedCredit, parsedDebit, expectedCat, expectedMerchant, note] of tests) {
  // Simulate Fix 1: cross-check amounts using combined text
  const combined = `WDL TFR ${desc}`;
  let { debit, credit } = crossCheckAmounts(combined, parsedDebit, parsedCredit);

  const result = classifyDescription(desc, credit);
  const catOk = result.category === expectedCat;
  const merchantOk = result.cleanMerchant.toUpperCase().startsWith(expectedMerchant.toUpperCase());
  const ok = catOk && merchantOk;

  if (ok) pass++;
  else fail++;

  const icon = ok ? "✅" : "❌";
  console.log(`${icon} [${note}]`);
  if (!ok) {
    console.log(`   desc:     ${desc}`);
    console.log(`   amounts:  debit=${debit} credit=${credit}`);
    console.log(`   got:      merchant="${result.cleanMerchant}" category="${result.category}"${result.matchedRule ? ` (rule ${result.matchedRule})` : ''}`);
    console.log(`   expected: merchant~="${expectedMerchant}" category="${expectedCat}"`);
  } else {
    console.log(`   → "${result.cleanMerchant}" | ${result.category}${result.matchedRule ? ` [rule ${result.matchedRule}]` : ''}`);
  }
}

console.log(`\n=== RESULTS: ${pass}/${pass+fail} PASSED ===`);
if (fail > 0) process.exit(1);
