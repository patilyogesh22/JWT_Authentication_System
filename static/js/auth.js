function getCookie(name) {
  let val = null;
  if (document.cookie) {
    document.cookie.split(';').forEach(c => {
      c = c.trim();
      if (c.startsWith(name + '=')) val = decodeURIComponent(c.slice(name.length + 1));
    });
  }
  return val;
}

function showMsg(type, text) {
  const msg = document.getElementById('msg');
  if (!msg) return;
  msg.className = 'show ' + type;
  msg.textContent = text;
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.textContent;
    btn.textContent = 'Please wait...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (e ? e.clientX - rect.left : rect.width / 2) - size / 2;
  const y = (e ? e.clientY - rect.top : rect.height / 2) - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

async function register(btn, e) {
  addRipple(btn, e);
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !email || !password) { showMsg('error', 'All fields are required.'); return; }
  if (password.length < 8)              { showMsg('error', 'Password must be at least 8 characters.'); return; }

  setLoading(btn, true);
  showMsg('info', 'Creating your account...');

  try {
    const res  = await fetch('/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (res.ok) {
      showMsg('success', 'Account created! Redirecting to login...');
      setTimeout(() => window.location.href = '/', 1800);
    } else {
      const err = data.username?.[0] || data.email?.[0] || data.password?.[0] || data.detail || JSON.stringify(data);
      showMsg('error', err);
      setLoading(btn, false);
    }
  } catch (err) {
    showMsg('error', 'Network error. Please try again.');
    setLoading(btn, false);
  }
}

async function login(btn, e) {
  addRipple(btn, e);
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) { showMsg('error', 'Both fields are required.'); return; }

  setLoading(btn, true);
  showMsg('info', 'Signing you in...');

  try {
    const res  = await fetch('/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      showMsg('success', 'Login successful! Redirecting...');
      setTimeout(() => window.location.href = '/profile/', 800);
    } else {
      showMsg('error', 'Invalid username or password.');
      setLoading(btn, false);
    }
  } catch (err) {
    showMsg('error', 'Network error. Please try again.');
    setLoading(btn, false);
  }
}

async function loadProfile() {
  const token = localStorage.getItem('access_token');
  if (!token) { window.location.href = '/'; return; }

  try {
    const res = await fetch('/api/profile/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 401) { window.location.href = '/'; return; }

    const data = await res.json();
    const initials  = data.username.substring(0, 2).toUpperCase();
    const joined    = new Date(data.date_joined).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    const tokenSnip = token.substring(0, 24) + '...';

    document.getElementById('profile-data').innerHTML = `
      <div class="avatar-ring" style="animation:cardIn 0.5s 0.1s ease both;opacity:0">
        <div class="avatar">${initials}</div>
        <div class="avatar-info">
          <div class="name">${data.username}</div>
          <div class="role">${data.email}</div>
        </div>
        <span class="badge">Active</span>
      </div>

      <div class="profile-fields" style="animation:cardIn 0.5s 0.2s ease both;opacity:0">
        <div class="profile-field">
          <span class="pf-label">User ID</span>
          <span class="pf-value">#${data.id}</span>
        </div>
        <div class="profile-field">
          <span class="pf-label">Username</span>
          <span class="pf-value">${data.username}</span>
        </div>
        <div class="profile-field">
          <span class="pf-label">Email</span>
          <span class="pf-value">${data.email}</span>
        </div>
        <div class="profile-field">
          <span class="pf-label">Member since</span>
          <span class="pf-value">${joined}</span>
        </div>
        <div class="profile-field">
          <span class="pf-label">Access token</span>
          <span class="pf-value" style="font-family:monospace;font-size:0.78rem;color:var(--muted)">${tokenSnip}</span>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('profile-data').innerHTML =
      '<p style="color:var(--danger);font-size:0.9rem">Failed to load profile. Please try again.</p>';
  }
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/';
}

// allow Enter key to submit
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const btn = document.querySelector('.btn-primary');
  if (btn && !btn.disabled) btn.click();
});