import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// 1) Firebase config (replace this)
const firebaseConfig = {
  apiKey: "AIzaSyASKU3r-9Qr59ZTwg52adubXKQdmhE6DIM",
  authDomain: "chester-clothing.firebaseapp.com",
  projectId: "chester-clothing",
  storageBucket: "chester-clothing.firebasestorage.app",
  messagingSenderId: "95265873903",
  appId: "1:95265873903:web:9ad7fb3b84706f3d66e01a",
};

// 2) Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI helpers
const $ = (id) => document.getElementById(id);
const msgBox = $("msg");
const who = $("who");
const btnLogout = $("btnLogout");

function showMsg(text, ok = true) {
  msgBox.textContent = text;
  msgBox.className = ok ? "ok" : "err";
  msgBox.classList.remove("hide");
}

function hideMsg() {
  msgBox.classList.add("hide");
}

// 3) Sign Up
$("btnSignup").addEventListener("click", async () => {
  hideMsg();

  const name = $("su_name").value.trim();
  const email = $("su_email").value.trim();
  const pass = $("su_pass").value;

  if (!name) return showMsg("Please enter your full name.", false);
  if (!email) return showMsg("Please enter email.", false);
  if (!pass || pass.length < 6) return showMsg("Password must be at least 6 characters.", false);

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // Store user profile in Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      name,
      email,
      role: "user",
      createdAt: serverTimestamp()
    });

    showMsg("Account created! You are now logged in ✅");
    $("su_pass").value = "";
  } catch (e) {
    showMsg(`Sign up failed: ${e.code || ""} ${e.message || e}`, false);
  }
});

// 4) Login
$("btnLogin").addEventListener("click", async () => {
  hideMsg();

  const email = $("li_email").value.trim();
  const pass = $("li_pass").value;

  if (!email || !pass) return showMsg("Enter email and password.", false);

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showMsg("Logged in ✅");
    $("li_pass").value = "";
  } catch (e) {
    showMsg(`Login failed: ${e.code || ""} ${e.message || e}`, false);
  }
});

// 5) Logout
btnLogout.addEventListener("click", async () => {
  hideMsg();
  try {
    await signOut(auth);
    showMsg("Logged out 👋");
  } catch (e) {
    showMsg(`Logout failed: ${e.message || e}`, false);
  }
});

// 6) Auth state listener (show who is logged in)
onAuthStateChanged(auth, (user) => {
  if (user) {
    who.textContent = `Logged in as: ${user.email}`;
    btnLogout.classList.remove("hide");
  } else {
    who.textContent = "Not logged in";
    btnLogout.classList.add("hide");
  }
});