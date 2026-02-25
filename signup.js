import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnSignup");

function showMsg(text, ok = true) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.border = ok ? "1px solid #6ee7b7" : "1px solid #fca5a5";
  msg.style.background = ok ? "rgba(110,231,183,0.15)" : "rgba(252,165,165,0.15)";
}

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creating..." : "Sign Up";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!fullName) return showMsg("Please enter your full name.", false);
  if (!email) return showMsg("Please enter your email.", false);
  if (!password || password.length < 6) return showMsg("Password must be at least 6 characters.", false);

  try {
    setLoading(true);

    // 1) Create Auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2) Optional: set displayName in Auth profile
    await updateProfile(cred.user, { displayName: fullName });

    const uid = cred.user.uid;

    // 3) Save user profile in Firestore (users/{uid})
    await setDoc(doc(db, "users", uid), {
      uid,
      fullName,
      email,
      role: "user",
      createdAt: serverTimestamp()
    }, { merge: true });

    showMsg("Account created! Redirecting to login… ✅", true);

    // If gusto mo diretso sa main page, change to index.html
    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);

  } catch (err) {
    console.error(err);

    // Friendly error mapping
    const code = err?.code || "";
    let text = err?.message || "Signup failed.";

    if (code === "auth/email-already-in-use") text = "This email is already registered. Try login instead.";
    if (code === "auth/invalid-email") text = "Invalid email format.";
    if (code === "auth/weak-password") text = "Weak password. Use at least 6 characters.";

    showMsg(text, false);
  } finally {
    setLoading(false);
  }
});