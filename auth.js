
/* Public project connection values. Never put a secret/service-role key here. */
const musicalityClient = window.supabase?.createClient(
  'https://iogpdvijeqmjnxdmqieb.supabase.co',
  'sb_publishable_KBNbGof6WEDmM9mW8lj5bg_40CXNdRQ'
);
let currentUser = null, currentProfile = null, authMode = 'login', sessionVersion = 0;
const authDialog = document.getElementById('auth-dialog');
const authForm = document.getElementById('auth-form');
const authStatus = document.getElementById('auth-status');
function storageKey(kind) { return 'musicality-' + (currentUser?.id || 'guest') + '-' + kind; }
function readAccountList(kind) {
  try { const value = JSON.parse(localStorage.getItem(storageKey(kind)) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('auth-title').textContent = mode === 'signup' ? 'Find your people.' : mode === 'recovery' ? 'Set a new password.' : 'Welcome back.';
  document.getElementById('signup-name-row').hidden = mode !== 'signup';
  document.getElementById('email-row').hidden = mode === 'recovery';
  document.getElementById('auth-email').required = mode !== 'recovery';
  document.getElementById('auth-name').required = mode === 'signup';
  document.getElementById('auth-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  document.getElementById('auth-submit').textContent = mode === 'signup' ? 'Create account ↗' : mode === 'recovery' ? 'Save password ↗' : 'Log in ↗';
  document.getElementById('auth-tabs').hidden = mode === 'recovery';
  document.getElementById('forgot-password').hidden = mode !== 'login';
  document.querySelectorAll('[data-auth-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.authMode === mode)));
  authStatus.textContent = '';
}
function showAuth() {
  if (!authDialog.open) authDialog.showModal();
}
authDialog.addEventListener('cancel', e => e.preventDefault());
document.querySelectorAll('[data-auth-mode]').forEach(b => b.onclick = () => setAuthMode(b.dataset.authMode));
function syncIdentity() {
  const name = currentProfile?.name || currentUser?.user_metadata?.name || 'Your profile';
  document.querySelector('.account').innerHTML = '<b>' + esc(name.charAt(0).toUpperCase()) + '</b><span>' + esc(name) + '<br><small>Your creative space</small></span>';
  document.querySelector('header .avatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('logout').hidden = !currentUser;
}
async function applySession(session) {
  const version = ++sessionVersion;
  currentUser = session?.user || null;
  currentProfile = null;
  inbox = readAccountList('inbox');
  saved = readAccountList('saved');
  selected = 0;
  if (!currentUser) {
    page = 'discover'; render(); syncIdentity(); showAuth(); return;
  }
  authDialog.close();
  syncIdentity();
  if (page === 'profile') render();
  const { data, error } = await musicalityClient.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
  if (version !== sessionVersion) return;
  if (error) {
    toast('Could not load your profile. Check the database setup and try again.');
    page = 'profile'; render(); return;
  }
  currentProfile = data;
  syncIdentity();
  if (!data?.name) page = 'profile';
  render();
}
authForm.onsubmit = async e => {
  e.preventDefault();
  if (!musicalityClient) { authStatus.textContent = 'Login service could not load. Refresh and try again.'; return; }
  const button = document.getElementById('auth-submit');
  button.disabled = true;
  authStatus.textContent = '';
  try {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    let result;
    if (authMode === 'recovery') {
      result = await musicalityClient.auth.updateUser({ password });
      if (result.error) throw result.error;
      authForm.reset(); authDialog.close(); toast('Password updated.'); return;
    }
    if (authMode === 'signup') {
      result = await musicalityClient.auth.signUp({
        email, password,
        options: { data: { name: document.getElementById('auth-name').value.trim() }, emailRedirectTo: location.origin + location.pathname }
      });
      if (result.error) throw result.error;
      if (!result.data.session) {
        authForm.reset(); setAuthMode('login');
        authStatus.textContent = 'Check your email for a confirmation link, then return here to log in.';
        return;
      }
    } else {
      result = await musicalityClient.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    }
    authForm.reset();
    await applySession(result.data.session);
  } catch (error) { authStatus.textContent = error.message || 'Could not sign in. Please try again.'; }
  finally { button.disabled = false; }
};
document.getElementById('forgot-password').onclick = async () => {
  const email = document.getElementById('auth-email').value.trim();
  if (!email || !document.getElementById('auth-email').checkValidity()) {
    authStatus.textContent = 'Enter your email address first.'; return;
  }
  if (!musicalityClient) { authStatus.textContent = 'Login service could not load. Refresh and try again.'; return; }
  const button = document.getElementById('forgot-password');
  button.disabled = true;
  try {
    const { error } = await musicalityClient.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    authStatus.textContent = error ? error.message : 'If an account exists, a password reset link will arrive by email.';
  } catch { authStatus.textContent = 'Could not request a reset. Try again.'; }
  finally { button.disabled = false; }
};
document.getElementById('logout').onclick = async () => {
  const { error } = await musicalityClient.auth.signOut();
  if (error) { toast('Could not log out. Try again.'); return; }
  stopAudio();
  document.getElementById('compose').close();
  await applySession(null);
  setAuthMode('login');
};
function renderAccountProfile() {
  if (!currentUser) { main.innerHTML = '<div class="empty">Log in to create your profile.</div>'; showAuth(); return; }
  const p = currentProfile || { name: currentUser.user_metadata?.name || '', role:'',city:'',genres:'',looking:'',prompt:'' };
  main.innerHTML = heading('YOUR CREATIVE SPACE','Your sound.<br>Your <em>identity.</em>','Create your own profile. Your changes are saved to your account.') +
    '<form id="edit" class="edit">' +
    [['name','Your name'],['role','What do you do?'],['city','Your city'],['genres','Genres / sounds you love'],['looking','Who are you looking for?']]
      .map(([key,label]) => '<label for="' + key + '">' + label + '</label><input class="edit-input" id="' + key + '" name="' + key + '" maxlength="200" value="' + esc(p[key] || '') + '" ' + (key === 'name' ? 'required' : '') + '>').join('') +
    '<label for="prompt">We’ll work well together if…</label><textarea id="prompt" name="prompt" rows="3" maxlength="2000">' + esc(p.prompt || '') + '</textarea>' +
    '<button class="primary" id="save-profile">Save profile ↗</button><p id="profile-status" class="hint" role="status">Saved securely to your account. Discovery currently shows sample profiles.</p></form>';
  document.getElementById('edit').onsubmit = async e => {
    e.preventDefault();
    const userId = currentUser?.id;
    if (!userId) { showAuth(); return; }
    const values = Object.fromEntries(new FormData(e.target));
    for (const key of Object.keys(values)) values[key] = values[key].trim();
    if (!values.name) { document.getElementById('profile-status').textContent = 'Please enter your name.'; return; }
    const button = document.getElementById('save-profile');
    button.disabled = true;
    try {
      const { data, error } = await musicalityClient.from('profiles').upsert({ ...values, id: userId }).select().single();
      if (userId !== currentUser?.id) return;
      if (error) throw error;
      currentProfile = data; syncIdentity();
      document.getElementById('profile-status').textContent = 'Profile saved to your account.';
      toast('Your profile is saved.');
    } catch (error) {
      if (userId === currentUser?.id) document.getElementById('profile-status').textContent = 'Could not save your profile. ' + (error.message || 'Please try again.');
    } finally { if (button.isConnected) button.disabled = false; }
  };
}
setAuthMode('login');
showAuth();
if (!musicalityClient) {
  authStatus.textContent = 'Login service could not load. Refresh and check your connection.';
} else {
  musicalityClient.auth.onAuthStateChange((event, session) => {
    // Avoid awaiting other Supabase operations inside its auth callback.
    setTimeout(() => {
      if (event === 'PASSWORD_RECOVERY') {
        applySession(session).then(() => { setAuthMode('recovery'); showAuth(); });
      } else if (event !== 'TOKEN_REFRESHED') applySession(session);
    }, 0);
  });
}
