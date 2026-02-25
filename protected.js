import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Build "next" url = current page filename + query/hash
const file = window.location.pathname.split("/").pop() || "home.html";
const next = encodeURIComponent(file + window.location.search + window.location.hash);

// Protect any page that includes this script
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = `login.html?next=${next}`;
  }
});

// Optional: attach logout if logoutLink exists on the page
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
    } finally {
      window.location.href = "index.html";
    }
  });
}