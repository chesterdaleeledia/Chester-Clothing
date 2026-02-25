import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// TODO: Replace with your Firebase config (Project settings -> Your apps -> Web app)
const firebaseConfig = {
  apiKey: "AIzaSyASKU3r-9Qr59ZTwg52adubXKQdmhE6DIM",
  authDomain: "chester-clothing.firebaseapp.com",
  projectId: "chester-clothing",
  storageBucket: "chester-clothing.firebasestorage.app",
  messagingSenderId: "95265873903",
  appId: "1:95265873903:web:9ad7fb3b84706f3d66e01a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);