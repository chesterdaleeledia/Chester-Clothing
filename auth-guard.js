import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

function safeNext(nextRaw) {
  if (!nextRaw) return "home.html";
  if (nextRaw.includes("://") || nextRaw.startsWith("//")) return "home.html";
  if (nextRaw.startsWith("/")) nextRaw = nextRaw.slice(1);
  return nextRaw;
}

export function requireAuth({ loginPage = "login.html" } = {}) {
  const current =
    (location.pathname.split("/").pop() || "home.html") +
    location.search +
    location.hash;

  const next = encodeURIComponent(current);

  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub(); // ✅ stop listening after first result

      if (!user) {
        window.location.href = `${loginPage}?next=${next}`;
        return;
      }

      resolve(user);
    });
  });
}

export function setupLogout({ linkId = "logoutLink", redirectTo = "index.html" } = {}) {
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

export function getNextFromUrl() {
  const nextRaw = new URLSearchParams(location.search).get("next");
  return safeNext(nextRaw);
}