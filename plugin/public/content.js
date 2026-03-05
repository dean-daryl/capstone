// Content script injected into the frontend app pages.
// Syncs the JWT token from the frontend's localStorage to chrome.storage.local
// so the extension popup can reuse the same session.
//
// Content scripts run in an isolated world and cannot access the page's
// localStorage directly. We inject a small script into the page context
// that posts the token value back to us via window.postMessage.

function requestSync() {
  const script = document.createElement("script");
  script.textContent = `
    (function() {
      var token = localStorage.getItem("token");
      var userId = localStorage.getItem("userId");
      window.postMessage({ type: "SOMATEK_TOKEN_SYNC", token: token, userId: userId }, "*");
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove();
}

let lastToken = null;

window.addEventListener("message", (event) => {
  if (event.source !== window || event.data?.type !== "SOMATEK_TOKEN_SYNC") return;

  const token = event.data.token;
  const userId = event.data.userId;
  if (token === lastToken) return;
  lastToken = token;

  if (token) {
    chrome.storage.local.set({ authToken: token, userId: userId });
  } else {
    chrome.storage.local.remove(["authToken", "userId"]);
  }
});

// Sync on load and poll every 2 seconds
requestSync();
setInterval(requestSync, 2000);
