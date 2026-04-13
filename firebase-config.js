// ============================================================
//  Firebase — Configuração do projeto
// ------------------------------------------------------------
//  1. Crie um projeto em https://console.firebase.google.com
//  2. Em Configurações do projeto > Seus apps > Web, registre um app
//  3. Cole as credenciais abaixo, substituindo os valores placeholder
//  4. Ative Authentication > Email/Senha
//  5. Ative Cloud Firestore (modo produção) e cole as regras do README
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "COLE_SUA_API_KEY_AQUI",
  authDomain:        "seu-projeto.firebaseapp.com",
  projectId:         "seu-projeto",
  storageBucket:     "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:abcdef123456"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
