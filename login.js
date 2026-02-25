import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getNextFromUrl } from "./auth-guard.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnLogin");

const nextPage = getNextFromUrl(); // e.g. caps.html, tshirts.html, etc.
let redirected = false;

function showMsg(text, ok = true) {
  if (!msg) return alert(text);
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.border = ok ? "1px solid #6ee7b7" : "1px solid #fca5a5";
  msg.style.background = ok ? "rgba(110,231,183,0.15)" : "rgba(252,165,165,0.15)";
}

function setLoading(isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Logging in..." : "Login";
}

function goNext() {
  if (redirected) return;
  redirected = true;
  window.location.href = nextPage || "home.html";
}

// If already logged in, go directly to next (NOT always home)
onAuthStateChanged(auth, (user) => {
  if (user) goNext();
});

if (!form) {
  console.error("loginForm not found. Check login.html IDs.");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return showMsg("Please enter email and password.", false);

    try {
      setLoading(true);

      const cred = await signInWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) localStorage.setItem("userProfile", JSON.stringify(snap.data()));

      showMsg("Login successful ✅ Redirecting...", true);
      setTimeout(goNext, 250);

    } catch (err) {
      console.error(err);
      showMsg("Wrong email or password.", false);
    } finally {
      setLoading(false);
    }
  });
}