const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Add "Forgot password?" link next to remember checkbox in Sign In form
const targetSignInControls = `<div class="flex items-center justify-between text-xs text-slate-400">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" id="signin-remember" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500">
            <span>Remember this device</span>
          </label>
        </div>`;

const newSignInControls = `<div class="flex items-center justify-between text-xs text-slate-400">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" id="signin-remember" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500">
            <span>Remember this device</span>
          </label>
          <button type="button" onclick="openForgotPasswordModal()" class="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Forgot password?
          </button>
        </div>`;

const targetSignInControlsCRLF = targetSignInControls.replace(/\n/g, '\r\n');
const newSignInControlsCRLF = newSignInControls.replace(/\n/g, '\r\n');

if (html.includes(targetSignInControlsCRLF)) {
  html = html.replace(targetSignInControlsCRLF, newSignInControlsCRLF);
  console.log('✅ Added Forgot Password link in sign-in form (CRLF)');
} else if (html.includes(targetSignInControls)) {
  html = html.replace(targetSignInControls, newSignInControls);
  console.log('✅ Added Forgot Password link in sign-in form (LF)');
} else {
  console.log('⚠️ Could not match targetSignInControls');
}

// 2. Add Modal for Forgot Password right before </body> or right after other modals
const forgotModalHtml = `
  <!-- ========================================== -->
  <!-- MODAL: FORGOT PASSWORD RECOVERY -->
  <!-- ========================================== -->
  <div id="modal-forgot-password" class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="modal-box glass-panel bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
            🔑
          </div>
          <div>
            <h3 class="font-bold text-sm text-white">Reset Account Password</h3>
            <p class="text-[11px] text-slate-400">Secure recovery via Supabase Cloud Auth</p>
          </div>
        </div>
        <button type="button" onclick="closeForgotPasswordModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>

      <div id="forgot-alert" class="hidden p-3 rounded-xl text-xs font-medium border flex items-center space-x-2">
        <span id="forgot-alert-icon"></span>
        <span id="forgot-alert-text"></span>
      </div>

      <form id="form-forgot-password" onsubmit="handleForgotPasswordSubmit(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-300 font-semibold mb-1">Enter your registered Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"></path></svg>
            </span>
            <input type="email" id="forgot-email" required placeholder="your.name@example.com" class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500">
          </div>
          <p class="text-[11px] text-slate-400 mt-1">We will send a password reset link to this email address.</p>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button type="button" onclick="closeForgotPasswordModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition">
            Cancel
          </button>
          <button type="submit" id="btn-submit-forgot" class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5">
            <span>Send Reset Link</span>
          </button>
        </div>
      </form>
    </div>
  </div>
`;

if (!html.includes('modal-forgot-password')) {
  html = html.replace('<!-- ========================================== -->\n  <!-- MODAL: PDF STATEMENT PASSWORD UNLOCK -->', forgotModalHtml + '\n  <!-- ========================================== -->\n  <!-- MODAL: PDF STATEMENT PASSWORD UNLOCK -->');
  html = html.replace('<!-- ========================================== -->\r\n  <!-- MODAL: PDF STATEMENT PASSWORD UNLOCK -->', forgotModalHtml.replace(/\n/g, '\r\n') + '\r\n  <!-- ========================================== -->\r\n  <!-- MODAL: PDF STATEMENT PASSWORD UNLOCK -->');
  console.log('✅ Added modal-forgot-password to index.html');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Saved index.html successfully');
