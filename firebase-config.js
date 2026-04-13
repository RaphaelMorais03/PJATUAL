// ============================================================
//  Firebase — Projeto PJATUAL
//  Portal Amor Saúde Pirituba
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCxX6N4h62I3uyzq2r1FBDIUmXGwUoeafc",
  authDomain:        "pjatual-f2f9e.firebaseapp.com",
  projectId:         "pjatual-f2f9e",
  storageBucket:     "pjatual-f2f9e.firebasestorage.app",
  messagingSenderId: "242197649179",
  appId:             "1:242197649179:web:c2216edcc15da45d7ea5be"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
