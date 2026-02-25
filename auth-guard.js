import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Make sure "next" is safe (no external redirect)
function safeNext(nextRaw) {
  if (!nextRaw) return "home.html";

  // Block external redirects
  if (nextRaw.includes("://") || nextRaw.startsWith("//")) return "home.html";

  // Clean leading slash (just in case)
  if (nextRaw.startsWith("/")) nextRaw = nextRaw.slice(1);

  return nextRaw;
}

/**
 * Protect a page using Firebase Auth.
 * If user not logged in -> redirect to login.html?next=<current page>
 */
export function requireAuth({ loginPage = "login.html" } = {}) {
  const current =
    (location.pathname.split("/").pop() || "home.html") +
    location.search +
    location.hash;

  const next = encodeURIComponent(current);

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = `${loginPage}?next=${next}`;
        return;
      }
      resolve(user);
    });
  });
}

/**
 * Setup Logout link to do Firebase signOut()
 */
export function setupLogout({
  linkId = "logoutLink",
  redirectTo = "index.html"
} = {}) {
  const link = document.getElementById(linkId);
  if (!link) return;

  link.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
    } finally {
      window.location.href = redirectTo;
    }
  });
}

/**
 * Use on login page:
 * const next = getNextFromUrl(); then redirect to it after login
 */
export function getNextFromUrl() {
  const nextRaw = new URLSearchParams(location.search).get("next");
  return safeNext(nextRaw);
}