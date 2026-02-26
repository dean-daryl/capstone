// Content script injected into the frontend app pages.
// Syncs the JWT token from the frontend's localStorage to chrome.storage.local
// so the extension popup can reuse the same session.

let lastToken = null;

function syncToken() {
  const token = localStorage.getItem("token");
  if (token === lastToken) return;
  lastToken = token;

  if (token) {
    chrome.storage.local.set({ authToken: token });
  } else {
    chrome.storage.local.remove(["authToken"]);
  }
}

// Sync immediately on load
syncToken();

// Poll every 2 seconds to catch login/logout changes.
// Content scripts run in an isolated world so we can't intercept
// the page's localStorage.setItem calls directly.
setInterval(syncToken, 2000);

// Also catch cross-tab changes
window.addEventListener("storage", syncToken);
