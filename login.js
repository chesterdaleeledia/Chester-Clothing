import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnLogin");

function showMsg(text, ok = true) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.border = ok ? "1px solid #6ee7b7" : "1px solid #fca5a5";
  msg.style.background = ok ? "rgba(110,231,183,0.15)" : "rgba(252,165,165,0.15)";
}

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Logging in..." : "Login";
}

// read ?next=...
const params = new URLSearchParams(window.location.search);
const next = params.get("next") || "home.html";

let redirected = false;

// If already logged in, redirect to next (not always home)
onAuthStateChanged(auth, (user) => {
  if (user && !redirected) {
    redirected = true;
    window.location.href = next;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) return showMsg("Please enter email and password.", false);

  try {
    setLoading(true);

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // optional: update last login
    await setDoc(doc(db, "users", uid), { lastLoginAt: serverTimestamp() }, { merge: true });

    // optional: fetch profile
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) localStorage.setItem("userProfile", JSON.stringify(snap.data()));

    showMsg("Login successful ✅ Redirecting...", true);

    redirected = true;
    setTimeout(() => window.location.href = next, 400);

  } catch (err) {
    console.error(err);
    const code = err?.code || "";

    let text = "Login failed.";
    if (code === "auth/invalid-credential") text = "Wrong email or password.";
    else if (code === "auth/invalid-email") text = "Invalid email format.";
    else if (err?.message) text = err.message;

    showMsg(text, false);
  } finally {
    setLoading(false);
  }
});