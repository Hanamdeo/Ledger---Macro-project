// Debug script: simulate the PDF parser with sample SBI text
// to identify the off-by-one narration shift bug

const sampleText = `
01/11/2026 01/11/2026 WDL TFR
UPI/DR/150001569466/JUGAL
SH/YESB/paytm.s3w7/NO R
0097696162090 AT 64302
SANJIVANI NAGAR
- 10.00 - 389.53
01/11/2026 01/11/2026 WDL TFR
UPI/DR/174733687923/UPILITE
0095809162097 AT 64302
SANJIVANI NAGAR
- 230.00 - 159.53
01/11/2026 01/11/2026 WDL TFR
UPI/DR/182434683728/RAJESH
S/YESB/paytm.s31y/NO R
0097696162090 AT 64302
SANJIVANI NAGAR
- 70.00 - 89.53
01/11/2026 01/11/2026 WDL TFR
UPI/DR/214718181511/UPILITE
0095809162097 AT 64302
SANJIVANI NAGAR
- 20.00 - 69.53
01/11/2026 01/11/2026 WDL TFR
UPI/DR/221352093734/JUGAL
SH/YESB/paytmqr726/NO R
0097696162090 AT 64302
SANJIVANI NAGAR
- 30.00 - 39.53
02/11/2026 02/11/2026 DEP TFR
UPI/CR/132219086395/Sourabh
/SBIN/9177238282/PAY
0097732162091 AT 64302
SANJIVANI NAGAR
- - 100.00 139.53
02/11/2026 02/11/2026 WDL TFR
UPI/DR/145427242697/KANHAIYA
/YESB/paytmqrxpx/NO R
0097690162095 AT 64302
SANJIVANI NAGAR
- 10.00 - 129.53
02/11/2026 02/11/2026 WDL TFR
UPI/DR/145904959965/PUNEET
H/YESB/paytm.s2eu/NO R
0097690162095 AT 64302
SANJIVANI NAGAR
- 20.00 - 109.53
02/11/2026 02/11/2026 WDL TFR
UPI/DR/164728365818/SAUBHAG
Y/YESB/paytm.s2yx/NO R
0097690162095 AT 64302
SANJIVANI NAGAR
- 10.00 - 99.53
02/11/2026 02/11/2026 WDL TFR
UPI/DR/180047986589/SATYANAR
/YESB/paytm.s1ip/NO R
0097690162095 AT 64302
SANJIVANI NAGAR
- 40.00 - 59.53
`;

// ── Reproduce the parser logic ──
const DATE_LINE_RE = /^\d{2}[-/]\d{2}[-/]\d{2,4}/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const NOISE = /Statement\s*(From|To|of|Summary)|Account\s*(Number|open|Status)|Branch\s*(Code|Email|Phone)|MICR|IFSC|CIF\s*Num|Drawing\s*Power|Interest\s*Rate|Nominee|Currency|Product|Welcome|Page\s*no|Brought\s*Forward|Total\s*Debit|Total\s*Credit|Closing\s*Balance|CKYCR|Please\s*do\s*not|computer\s*generated|Power\s*of\s*Attorney/i;

function isDateLine(line) {
  return (DATE_LINE_RE.test(line) || ISO_DATE_RE.test(line)) && !NOISE.test(line);
}

const lines = sampleText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

// Collect blocks
const blocks = [];
let currentBlock = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (isDateLine(line)) {
    if (currentBlock) blocks.push(currentBlock);
    currentBlock = { lines: [line] };
  } else if (currentBlock) {
    if (NOISE.test(line)) {
      blocks.push(currentBlock);
      currentBlock = null;
    } else {
      currentBlock.lines.push(line);
    }
  }
}
if (currentBlock) blocks.push(currentBlock);

console.log(`\n=== FOUND ${blocks.length} BLOCKS ===\n`);

blocks.forEach((block, idx) => {
  console.log(`--- BLOCK ${idx + 1} ---`);
  console.log("  Raw lines:");
  block.lines.forEach((l, li) => console.log(`    [${li}] "${l}"`));

  // Stitch UPI lines
  const stitchedLines = [];
  for (let li = 0; li < block.lines.length; li++) {
    let line = block.lines[li];
    if (/UPI\/(DR|CR)\//i.test(line)) {
      while (li + 1 < block.lines.length) {
        const next = block.lines[li + 1];
        const isContinuation = !isDateLine(next) &&
          !/^(WDL|DEP)\s+TFR/i.test(next) &&
          !/^\d{10,}\s+AT\s+\d+/i.test(next) &&
          !/\bAT\s+\d{4,}\b/i.test(next) &&
          !/^\d+[\d,]*\.\d{2}$/.test(next);

        if (isContinuation) {
          line = line + next;
          li++;
        } else {
          break;
        }
      }
    }
    stitchedLines.push(line);
  }

  const combined = stitchedLines.join(" ");
  console.log("  Stitched lines:");
  stitchedLines.forEach((l, li) => console.log(`    [${li}] "${l}"`));
  console.log(`  Combined: "${combined}"`);

  // Extract amounts
  let debit = 0, credit = 0, balance = 0, amountFound = false;

  // Pattern A
  const tabMatch = combined.match(/-\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+\.\d{2})/);
  if (tabMatch) {
    const crVal = parseFloat(tabMatch[1].replace(/,/g, "")) || 0;
    const drVal = parseFloat(tabMatch[2].replace(/,/g, "")) || 0;
    const balVal = parseFloat(tabMatch[3].replace(/,/g, "")) || 0;
    balance = balVal;
    if (crVal > 0 && drVal === 0) { credit = crVal; amountFound = true; }
    else if (drVal > 0 && crVal === 0) { debit = drVal; amountFound = true; }
    else if (crVal > 0 || drVal > 0) { credit = crVal; debit = drVal; amountFound = true; }
    console.log(`  Amount (Pattern A): cr=${crVal} dr=${drVal} bal=${balVal}`);
  }

  // Pattern B
  if (!amountFound) {
    const sbiDrMatch = combined.match(/-\s+([\d,]+\.\d{2})\s+-\s+([\d,]+\.\d{2})/);
    if (sbiDrMatch) {
      debit = parseFloat(sbiDrMatch[1].replace(/,/g, "")) || 0;
      balance = parseFloat(sbiDrMatch[2].replace(/,/g, "")) || 0;
      amountFound = true;
      console.log(`  Amount (Pattern B): debit=${debit} balance=${balance}`);
    }
  }

  // Pattern C
  if (!amountFound) {
    const sbiCrMatch = combined.match(/-\s+-\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/);
    if (sbiCrMatch) {
      credit = parseFloat(sbiCrMatch[1].replace(/,/g, "")) || 0;
      balance = parseFloat(sbiCrMatch[2].replace(/,/g, "")) || 0;
      amountFound = true;
      console.log(`  Amount (Pattern C): credit=${credit} balance=${balance}`);
    }
  }

  // Extract narration
  const upiLine = stitchedLines.find(l => /UPI\/(DR|CR)\//i.test(l));
  let rawNarration = "";
  if (upiLine) {
    rawNarration = upiLine;
  } else {
    const narLines = stitchedLines.filter(l =>
      !DATE_LINE_RE.test(l) && !ISO_DATE_RE.test(l) &&
      !/[\d,]+\.\d{2}/.test(l) && !/^\d{9,}/.test(l) &&
      !/\bAT\s+\d{4,}\b/.test(l) && !/^(WDL|DEP)\s+TFR/i.test(l) &&
      !/^(KARMETA|BALANCE|Page\s*no)/i.test(l) && !NOISE.test(l)
    );
    rawNarration = narLines.join(" ").trim() || "BANK TXN";
  }

  // Extract entity from UPI narration
  let entity = rawNarration;
  const upiParts = rawNarration.match(/UPI\/(DR|CR)\/\d+\/([^/]+)/i);
  if (upiParts) entity = upiParts[2];

  console.log(`  Result: date=01-02/11, debit=${debit}, credit=${credit}, balance=${balance}`);
  console.log(`  Narration: "${rawNarration}"`);
  console.log(`  Extracted entity: "${entity}"`);
  console.log();
});

// Now show what SHOULD match
console.log("\n=== EXPECTED vs ACTUAL COMPARISON ===\n");
const expected = [
  { entity: "JUGALSH", debit: 10, balance: 389.53 },
  { entity: "UPILITE", debit: 230, balance: 159.53 },
  { entity: "RAJESHS", debit: 70, balance: 89.53 },
  { entity: "UPILITE", debit: 20, balance: 69.53 },
  { entity: "JUGALSH", debit: 30, balance: 39.53 },
  { entity: "Sourabh", credit: 100, balance: 139.53 },
  { entity: "KANHAIYA", debit: 10, balance: 129.53 },
  { entity: "PUNEETH", debit: 20, balance: 109.53 },
  { entity: "SAUBHAGY", debit: 10, balance: 99.53 },
  { entity: "SATYANAR", debit: 40, balance: 59.53 },
];
expected.forEach((e, i) => {
  console.log(`  Expected[${i+1}]: ${e.entity} | debit=${e.debit||0} credit=${e.credit||0} bal=${e.balance}`);
});
