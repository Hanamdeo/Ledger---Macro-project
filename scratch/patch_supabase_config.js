const fs = require('fs');
const path = require('path');

// 1. Update supabase-config.js to add cloudResetPassword
const supabaseConfigPath = path.join(__dirname, '..', 'supabase-config.js');
let sc = fs.readFileSync(supabaseConfigPath, 'utf8');

const resetFunc = `async function cloudResetPassword(email) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) throw error;
  return data;
}

`;

if (!sc.includes('cloudResetPassword')) {
  sc = sc.replace('async function cloudSignOut()', resetFunc + 'async function cloudSignOut()');
  sc = sc.replace('window.cloudSignOut = cloudSignOut;', 'window.cloudResetPassword = cloudResetPassword;\n  window.cloudSignOut = cloudSignOut;');
  fs.writeFileSync(supabaseConfigPath, sc, 'utf8');
  console.log('✅ Added cloudResetPassword to supabase-config.js');
} else {
  console.log('ℹ️ cloudResetPassword already present in supabase-config.js');
}
