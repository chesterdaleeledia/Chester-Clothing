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

console.log("✅ login.js loaded");

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnLogin");

function showMsg(text, ok = true) {
  if (!msg) return alert(text);
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.border = ok ? "1px solid #6ee7b7" : "1px solid #fca5a5";
  msg.style.background = ok
    ? "rgba(110,231,183,0.15)"
    : "rgba(252,165,165,0.15)";
}

function setLoading(isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Logging in..." : "Login";
}

// Prevent redirect loop / duplicate redirects
let redirected = false;

// Auto-redirect if already logged in (ex: user came back to login page)
onAuthStateChanged(auth, (user) => {
  if (user && !redirected) {
    redirected = true;
    window.location.href = "home.html";
  }
});

if (!form) {
  console.error("❌ loginForm not found. Check your login.html IDs.");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    const email = (emailEl?.value || "").trim();
    const password = passEl?.value || "";

    if (!email || !password) {
      return showMsg("Please enter email and password.", false);
    }

    try {
      setLoading(true);
      console.log("🔐 Attempt login:", email);

      // 1) Auth login
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      console.log("✅ Logged in uid:", uid);

      // 2) Update lastLoginAt (optional)
      await setDoc(
        doc(db, "users", uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      );

      // 3) FETCH user profile doc from Firestore
      const snap = await getDoc(doc(db, "users", uid));

      if (snap.exists()) {
        const profile = snap.data();
        console.log("📦 Fetched profile:", profile);

        // optional: store locally for using in UI
        localStorage.setItem("userProfile", JSON.stringify(profile));
      } else {
        console.warn("⚠️ user profile doc not found in Firestore for uid:", uid);
        // optional fallback: create minimal doc
        await setDoc(
          doc(db, "users", uid),
          {
            uid,
            email: cred.user.email || email,
            createdAt: serverTimestamp()
          },
          { merge: true }
        );
      }

      showMsg("Login successful ✅ Redirecting...", true);

      redirected = true;
      setTimeout(() => {
        window.location.href = "home.html";
      }, 500);

    } catch (err) {
      console.error("❌ Login error:", err);

      const code = err?.code || "";
      let text = "Login failed.";

      if (code === "auth/invalid-credential") text = "Wrong email or password.";
      else if (code === "auth/user-not-found") text = "No account found for this email.";
      else if (code === "auth/wrong-password") text = "Wrong password.";
      else if (code === "auth/invalid-email") text = "Invalid email format.";
      else if (code === "auth/too-many-requests") text = "Too many attempts. Try again later.";
      else if (err?.message) text = err.message;

      showMsg(text, false);
    } finally {
      setLoading(false);
    }
  });
}