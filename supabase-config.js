/**
 * Supabase Cloud Integration Client
 * Ledger - Personal Finance Analytics System
 * Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
 */

const SUPABASE_CONFIG = {
  // Supabase Project URL and Public Anon Key
  url: "https://svybzbaavhcfgrftzagg.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eWJ6YmFhdmhjZmdyZnR6YWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzAyNjksImV4cCI6MjEwODkwNjI2OX0.l5K-H9S_IVK_69Zfg8Jdn7i7F2W7ot5QU-8wgI_Bzu8"
};

let supabaseClient = null;

function isSupabaseConfigured() {
  return Boolean(
    window.supabase &&
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url !== "YOUR_SUPABASE_URL" &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.anonKey !== "YOUR_SUPABASE_ANON_KEY"
  );
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return supabaseClient;
}

// ==========================================
// SUPABASE AUTH HELPERS
// ==========================================
async function cloudSignUp(email, password, fullName) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured.");
  
  const { data, error } = await client.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  return data.user;
}

async function cloudSignIn(email, password) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured.");

  const { data, error } = await client.auth.signInWithPassword({
    email: email,
    password: password
  });
  if (error) throw error;
  return data.user;
}

async function cloudSignOut() {
  const client = getSupabase();
  if (!client) return;
  await client.auth.signOut();
}

async function cloudGetCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// ==========================================
// SUPABASE DATABASE (POSTGRESQL) HELPERS
// ==========================================
async function cloudFetchTransactions() {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Cloud fetch error:", error);
    throw error;
  }
  return data || [];
}

async function cloudSaveTransactions(transactions) {
  const client = getSupabase();
  if (!client) return;
  const user = await cloudGetCurrentUser();
  if (!user) throw new Error("Authentication required to save records.");

  const rows = transactions.map(t => ({
    user_id: user.id,
    transaction_id: t.transaction_id,
    date: t.date,
    raw_description: t.raw_description || t.description,
    description: t.description,
    category: t.category,
    debit: Number(t.debit) || 0,
    credit: Number(t.credit) || 0,
    balance: Number(t.balance) || 0,
    source_file: t.source_file || "Manual_Entry"
  }));

  // Upsert records
  const { error } = await client
    .from("transactions")
    .upsert(rows, { onConflict: "user_id,transaction_id" });

  if (error) {
    console.error("Cloud save error:", error);
    throw error;
  }
}

async function cloudDeleteTransaction(transactionId) {
  const client = getSupabase();
  if (!client) return;
  const user = await cloudGetCurrentUser();
  if (!user) return;

  const { error } = await client
    .from("transactions")
    .delete()
    .eq("user_id", user.id)
    .eq("transaction_id", transactionId);

  if (error) throw error;
}

async function cloudClearAllTransactions() {
  const client = getSupabase();
  if (!client) return;
  const user = await cloudGetCurrentUser();
  if (!user) return;

  const { error } = await client
    .from("transactions")
    .delete()
    .eq("user_id", user.id);

  if (error) throw error;
}

window.isSupabaseConfigured = isSupabaseConfigured;
window.cloudSignUp = cloudSignUp;
window.cloudSignIn = cloudSignIn;
window.cloudSignOut = cloudSignOut;
window.cloudGetCurrentUser = cloudGetCurrentUser;
window.cloudFetchTransactions = cloudFetchTransactions;
window.cloudSaveTransactions = cloudSaveTransactions;
window.cloudDeleteTransaction = cloudDeleteTransaction;
window.cloudClearAllTransactions = cloudClearAllTransactions;
